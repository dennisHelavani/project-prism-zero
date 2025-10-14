import { stripe } from '@/lib/stripe';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;

  // If Stripe didn’t send session_id, still show a simple success page
  if (!sessionId) {
    return (
      <main className="p-8 max-w-xl">
        <h1 className="text-2xl font-semibold">Success</h1>
        <p className="mt-2">Your checkout completed.</p>
        <p className="mt-2">
          Please check your inbox for an email with your one-time access link.
        </p>
        <a className="inline-block mt-6 underline" href="/pricing">Back to pricing</a>
      </main>
    );
  }

  // Fetch the session to show details
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price'],
  });

  const amount =
    typeof session.amount_total === 'number' ? (session.amount_total / 100).toFixed(2) : null;
  const currency = session.currency?.toUpperCase();
  const email =
    (session.customer_details?.email as string | undefined) ||
    (session.customer_email as string | undefined);

  const paymentStatus = session.payment_status; // 'paid' or 'no_payment_required' etc.

  const line = (session.line_items as any)?.data?.[0];
  const priceId: string | undefined = line?.price?.id;
  let product = session.metadata?.product as string | undefined;
  if (!product) {
    const ramOne = process.env.STRIPE_PRICE_RAMs_ONEOFF;
    const cppOne = process.env.STRIPE_PRICE_CPP_ONEOFF;
    if (priceId === ramOne) product = 'RAMS';
    if (priceId === cppOne) product = 'CPP';
  }

  return (
    <main className="p-8 max-w-xl space-y-2">
      <h1 className="text-2xl font-semibold">Success</h1>
      <p>Thank you{email ? `, ${email}` : ''}!</p>
      <p>
        Status: <b>{paymentStatus}</b>
      </p>
      {amount && currency && (
        <p>
          Total: <b>{amount} {currency}</b>
        </p>
      )}
      {product && <p>Product: <b>{product}</b></p>}

      <hr className="my-4" />
      <p>
        If you haven’t received the email with your one-time access link yet, give it a minute and
        check your spam/junk folder. (In local dev, make sure your Stripe <code>listen</code> is
        running and <code>RESEND_API_KEY</code>/<code>FROM_EMAIL</code> are set.)
      </p>
      <a className="inline-block mt-6 underline" href="/pricing">Back to pricing</a>
    </main>
  );
}
