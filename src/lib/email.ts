// Server-only email adapter: Resend → SMTP fallback → dev log
import 'server-only';

type SendArgs = { to: string | string[]; subject: string; html: string; from?: string };

export async function sendEmail({ to, subject, html, from }: SendArgs) {
  const FROM = from || process.env.FROM_EMAIL || 'Hard Hat AI <no-reply@hardhatai.co>';

  // 1) Resend (production-ready)
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.send({ from: FROM, to, subject, html });
    if ((res as any)?.error) throw (res as any).error;
    return { ok: true, provider: 'resend' as const, id: (res as any)?.data?.id };
  }

  // 2) SMTP (Nodemailer) fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // 👇 ensure we grab the ESM default export
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: String(process.env.SMTP_SECURE ?? 'false') === 'true', // true for 465
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    return { ok: true, provider: 'smtp' as const, id: info.messageId };
  }

  // 3) Dev mode: print to console (no sending)
  // This keeps local testing simple when you don't want to send real emails.
  console.log('[DEV email]', { to, subject, html });
  return { ok: true, provider: 'dev' as const };
}
