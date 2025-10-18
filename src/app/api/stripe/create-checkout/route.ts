// src/app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

type Product = 'RAMS' | 'CPP';

const priceFor = (p: Product) =>
  p === 'RAMS' ? process.env.STRIPE_PRICE_RAMs_ONEOFF : process.env.STRIPE_PRICE_CPP_ONEOFF;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:9002';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, product }: { email?: string; product?: Product } =
      await req.json().catch(() => ({}));

    const cleanEmail = (email ?? '').toString().trim();
    const chosen: Product = product === 'RAMS' ? 'RAMS' : 'CPP';
    const priceId = priceFor(chosen);

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    if (!priceId) {
      return NextResponse.json({ error: `Missing price for ${chosen}` }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // one-time payment
      customer_email: cleanEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { product: chosen },
      // send the session id back to our success page
      success_url: `${BASE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing?canceled=1`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('[create-checkout] error:', err?.message || err);
    return NextResponse.json(
      { error: err?.raw?.message || err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
