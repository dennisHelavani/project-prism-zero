// /app/api/stripe/webhook/route.ts
import { headers as nextHeaders } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';



const supabaseAdmin = getSupabaseAdmin();
// ---- Resend (HTTP) ----
async function sendEmailViaResendHTTP(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL!, // e.g. "Hard Hat AI <no-reply@hardhatai.co>"
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error('[WB] Resend HTTP error:', resp.status, errText);
    return { ok: false as const, id: null };
  }
  const json = await resp.json().catch(() => ({}));
  return { ok: true as const, id: json?.data?.id ?? json?.id ?? null };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Product = 'RAMS' | 'CPP';
const mapPriceToProduct = (id?: string): Product | null => {
  if (!id) return null;
  if (id === process.env.STRIPE_PRICE_RAMs_ONEOFF) return 'RAMS';
  if (id === process.env.STRIPE_PRICE_CPP_ONEOFF) return 'CPP';
  return null;
};

// Generate a short 6-char code (A-Z0-9, no confusing chars)
function genCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Format a date-only label in the user's locale (no time)
function formatDateOnly(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(d);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();
  const headerList = await nextHeaders();
  const sig = (headerList.get('stripe-signature') || '').trim();

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WB] Missing signature/secret');
    return new NextResponse('Missing signature/secret', { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[WB] Invalid signature:', err?.message || err);
    return new NextResponse(`Invalid signature: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const base = event.data.object as any;
      console.log('[WB] checkout.session.completed id=', base.id);

      // Retrieve full session (reliable price/email)
      const session = await stripe.checkout.sessions.retrieve(base.id, {
        expand: ['line_items.data.price', 'customer', 'payment_intent'],
      });

      const status = session.payment_status; // 'paid' | 'no_payment_required'
      console.log('[WB] payment_status =', status);
      if (!['paid', 'no_payment_required'].includes(status)) {
        return NextResponse.json({ received: true, note: 'not_finalized' });
      }

      const email: string | undefined =
        session.customer_details?.email || session.customer_email || undefined;
      if (!email) {
        console.warn('[WB] No email on session; cannot send code.');
        return NextResponse.json({ received: true, note: 'no_email' });
      }
      console.log('[WB] email =', email);

      // Determine product
      const line = (session.line_items as any)?.data?.[0];
      const priceId: string | undefined = line?.price?.id;
      let product: Product | null = mapPriceToProduct(priceId);
      if (!product && session.metadata?.product) {
        const meta = String(session.metadata.product);
        if (meta === 'RAMS' || meta === 'CPP') product = meta;
      }
      if (!product) product = 'CPP';

      // Create a unique CODE and store it
      const code = genCode(6);
      const MS_PER_DAY = 86_400_000;
      const TTL_DAYS = Number(process.env.ACCESS_CODE_TTL_DAYS ?? 30); // default 30
      const expires = new Date(Date.now() + TTL_DAYS * MS_PER_DAY).toISOString();

      const { error } = await supabaseAdmin
        .from('access_links')
        .insert({ code, email, product, expires_at: expires, used: false });

      if (error) {
        console.error('[WB] Supabase insert error:', error);
        return NextResponse.json({ received: true, note: 'db_error' });
      }
      console.log('[WB] Code inserted:', code);

      // Email the CODE with a polished dark theme + explicit expiry date
      const accessUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/access`;
      const expiryLabel = formatDateOnly(expires) || 'soon';
      const subject = `Your ${product} access code`;

      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; background:#0b0b0b; color:#fff; padding:24px;">
          <div style="max-width:560px; margin:0 auto; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:20px;">
            <h1 style="margin:0 0 8px 0; font-size:22px; line-height:1.3;">Thanks — your purchase is confirmed</h1>
            <p style="margin:0 0 16px 0; color:rgba(255,255,255,.75);">
              You recently purchased <b>${product}</b>. Use the access code below to submit your request.
            </p>

            <div style="margin:16px 0; padding:14px 16px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:12px;">
              <div style="font-size:12px; color:rgba(255,255,255,.6);">Access code</div>
              <div style="margin-top:6px; font-size:28px; font-weight:800; letter-spacing:2px; color:#fff;">${code}</div>
            </div>

            <p style="margin:10px 0 0 0; color:rgba(255,255,255,.75);">
              Expires on <b>${expiryLabel}</b>. Codes are single-use.
            </p>

            <div style="margin-top:20px;">
              <a href="${accessUrl}" style="display:inline-block; background:#fff; color:#000; text-decoration:none; padding:10px 14px; border-radius:10px; font-weight:600;">
                Open Access Page
              </a>
            </div>

            <p style="margin:18px 0 0 0; font-size:12px; color:rgba(255,255,255,.55);">
              Tip: If you don’t see the email in your inbox, check Spam/Promotions.
            </p>
          </div>
        </div>
      `;

      const { ok, id } = await sendEmailViaResendHTTP({
        to: email,
        subject,
        html,
      });

      if (ok) console.log('[WB] Email sent, id:', id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[WB] Handler error:', err);
    return NextResponse.json({ received: true, note: 'handler_error' });
  }
}
