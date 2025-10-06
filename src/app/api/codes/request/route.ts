// src/app/api/codes/request/route.ts
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import {
  upsertCustomerByEmail,
  saveMonthlyCode,
  generatePlainCode,
  addUtcDays,
  monthKeyUtc,
} from '@/lib/codes';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Minimal email sender:
 * - If RESEND_API_KEY is set → sends via Resend
 * - Else → logs to console (dev-friendly)
 */
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'Hard Hat AI <no-reply@hardhatai.co>';

  if (!apiKey) {
    console.log('[DEV email]', { to, subject, html });
    return;
  }

  // If you don't have `resend` installed yet:
  //   npm i resend
  // Or add a type shim: declare module 'resend';
  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
}

export async function POST(req: Request) {
  try {
    const { email, days } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email_required' }, { status: 400 });
    }

    const ttlDays = typeof days === 'number' && days > 0 ? days : 30;

    // 1) Ensure customer exists (idempotent on normalized email)
    const customer = await upsertCustomerByEmail(email);

    // 2) Create a fresh code valid for N UTC days
    const code = generatePlainCode(8);
    const expires = addUtcDays(ttlDays);

    // 3) Bucket by current month (ISO at 00:00:00Z on day 1)
    const bucket = monthKeyUtc(new Date());

    // 4) Save/replace the monthly code for this customer + month
    await saveMonthlyCode(customer.id, code, expires, bucket);

    // 5) Magic link to /access with email+code prefilled
    const magic = new URL(`${APP_URL}/access`);
    magic.searchParams.set('email', email);
    magic.searchParams.set('code', code);

    const subject = `Your Hard Hat AI access code`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;color:#111">
        <h2>Here’s your code</h2>
        <p><strong style="font-size:18px;letter-spacing:1px">${code}</strong> (valid for ${ttlDays} days)</p>
        <p>Click to unlock and start your document:</p>
        <p>
          <a href="${magic.toString()}"
             style="background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
             Open Hard Hat AI
          </a>
        </p>
        <p style="margin-top:12px">If the button doesn’t work, copy this link:</p>
        <p style="word-break:break-all">${magic.toString()}</p>
      </div>
    `;

    await sendEmail(email, subject, html);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('/api/codes/request error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
