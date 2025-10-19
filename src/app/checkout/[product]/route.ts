// app/checkout/[product]/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

type Product = 'RAMS' | 'CPP';
const priceFor = (p: Product) =>
  p === 'RAMS'
    ? process.env.STRIPE_PRICE_RAMS_ONEOFF   // ← fixed key
    : process.env.STRIPE_PRICE_CPP_ONEOFF;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { product?: string } }   // ← plain object, no Promise
) {
  try {
    const key = (params.product ?? '').toUpperCase();
    const product: Product = key === 'RAMS' ? 'RAMS' : 'CPP';

    const priceId = priceFor(product);
    if (!priceId) {
      return NextResponse.json({ error: `Missing price for ${product}` }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { product },
      // Make sure NEXT_PUBLIC_SITE_URL is set in env (e.g., https://yourdomain.com)
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    // 303 redirect to Stripe Checkout
    return NextResponse.redirect(session.url as string, { status: 303 });
  } catch (err: any) {
    console.error('Checkout route error:', err);
    return NextResponse.json(
      { error: err?.raw?.message || err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
