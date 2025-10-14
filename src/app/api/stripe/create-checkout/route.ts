// src/app/api/stripe/create-checkout/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export async function POST(req: Request) {
  try {
    const { email, product } = await req.json();

    if (!email || !product) {
      return NextResponse.json({ error: 'email_and_product_required' }, { status: 400 });
    }

    // Choose price & mode
    let price: string | undefined;
    let mode: 'payment' | 'subscription' = 'payment';

    if (product === 'RAMS') {
      price = process.env.STRIPE_PRICE_RAMs_SUB;
      mode = 'subscription';
    } else if (product === 'CPP') {
      price = process.env.STRIPE_PRICE_CPP_ONEOFF;
      mode = 'payment';
    }

    if (!price) {
      return NextResponse.json({ error: 'price_not_configured' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${APP_URL}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
      metadata: { product }, // we’ll read this in the webhook
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('/api/stripe/create-checkout error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
