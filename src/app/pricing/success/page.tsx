// src/app/pricing/success/page.tsx
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs'; // server runtime
export const dynamic = 'force-dynamic'; // ensure fresh render after redirect back from Stripe

type SP = { session_id?: string };

export default async function SuccessPage({
  searchParams,
}: {
  // In Next.js 15 App Router, searchParams is async:
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const sessionId = sp?.session_id;

  // If Stripe didn’t send session_id, still show a simple success page
  if (!sessionId) {
    return (
      <main className="mx-auto max-w-2xl p-6 md:p-10">
        <h1 className="text-2xl font-semibold">Success</h1>
        <p className="mt-2">Your checkout completed.</p>
        <p className="mt-2">
          Please check your inbox for an email with your one-time access code and link.
        </p>
        <a className="mt-6 inline-block underline" href="/pricing">
          Back to Pricing
        </a>
      </main>
    );
  }

  // Try to retrieve the session to show extra details (amount, email, product)
  let amount: string | null = null;
  let currency: string | undefined;
  let email: string | undefined;
  let paymentStatus: string | undefined;
  let product: 'RAMS' | 'CPP' | undefined;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    });

    amount =
      typeof session.amount_total === 'number'
        ? (session.amount_total / 100).toFixed(2)
        : null;
    currency = session.currency?.toUpperCase();
    email =
      (session.customer_details?.email as string | undefined) ||
      (session.customer_email as string | undefined);
    paymentStatus = session.payment_status;

    // Determine product from metadata or price id
    const line = (session.line_items as any)?.data?.[0];
    const priceId: string | undefined = line?.price?.id;

    const ram = process.env.STRIPE_PRICE_RAMs_ONEOFF;
    const cpp = process.env.STRIPE_PRICE_CPP_ONEOFF;

    if (session.metadata?.product === 'RAMS' || session.metadata?.product === 'CPP') {
      product = session.metadata.product as 'RAMS' | 'CPP';
    } else if (priceId === ram) {
      product = 'RAMS';
    } else if (priceId === cpp) {
      product = 'CPP';
    }
  } catch {
    // If Stripe lookup fails, just fall back to the generic success UI below
  }

  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10 space-y-3">
      <h1 className="text-2xl font-semibold">Success</h1>
      <p>Thank you{email ? `, ${email}` : ''}!</p>

      {paymentStatus && (
        <p>
          Status: <b>{paymentStatus}</b>
        </p>
      )}

      {amount && currency && (
        <p>
          Total: <b>{amount} {currency}</b>
        </p>
      )}

      {product && (
        <p>
          Product: <b>{product}</b>
        </p>
      )}

      <hr className="my-4" />

      <p className="text-sm text-muted-foreground">
        If you haven’t received the email with your one-time access code yet, give it a minute and
        check your spam/junk folder. (In development, ensure your Stripe webhook is configured and
        <code className="mx-1">RESEND_API_KEY</code>/<code>FROM_EMAIL</code> are set.)
      </p>

      <a className="mt-4 inline-block underline" href="/pricing">
        Back to Pricing
      </a>
    </main>
  );
}
