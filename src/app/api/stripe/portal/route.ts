// app/api/stripe/portal/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  // TODO: resolve real customer id from your DB
  const customer = 'cus_XXXX';
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: process.env.STRIPE_BILLING_PORTAL_RETURN_URL!,
  });
  return NextResponse.json({ url: session.url });
}
