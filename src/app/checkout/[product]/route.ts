// app/checkout/[product]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

type Product = 'RAMS' | 'CPP';

const priceFor = (p: Product) =>
  p === 'RAMS'
    ? process.env.STRIPE_PRICE_RAMs_ONEOFF
    : process.env.STRIPE_PRICE_CPP_ONEOFF;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ product: string }> }
) {
  try {
    // ✅ params is now async, so we await it
    const { product } = await params;

    const key = String(product ?? '').toUpperCase();
    const resolvedProduct: Product = key === 'RAMS' ? 'RAMS' : 'CPP';

    const priceId = priceFor(resolvedProduct);
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing price for ${resolvedProduct}` },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { product: resolvedProduct },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    return NextResponse.redirect(session.url as string, { status: 303 });
  } catch (err: any) {
    console.error('Checkout route error:', err);
    return NextResponse.json(
      { error: err?.raw?.message || err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
