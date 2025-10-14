// /app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

type Product = 'RAMS' | 'CPP';

const priceFor = (p: Product) =>
  p === 'RAMS'
    ? process.env.STRIPE_PRICE_RAMs_ONEOFF
    : process.env.STRIPE_PRICE_CPP_ONEOFF;

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
      mode: 'payment', // one-time
      customer_email: cleanEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      // Expand so the webhook can read price->product without another API call
      expand: ['line_items.data.price'],
      // Fallback product hint for the webhook
      metadata: { product: chosen },
      // Include the session id so /success can render details
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    const msg = err?.raw?.message || err?.message || 'Unexpected error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
