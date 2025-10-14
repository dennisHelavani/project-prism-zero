// app/success/page.tsx
import PageShell from '@/components/layout/page-shell';
import { stripe } from '@/lib/stripe';
import { CheckCircle2 } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams; // Next 15
  const sessionId = typeof sp.session_id === 'string' ? sp.session_id : null;

  let productLabel: string | null = null;
  let email: string | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price', 'customer'],
      });
      email = (session.customer_details?.email || session.customer_email || null) as string | null;

      // determine product from price id or metadata
      const line: any = (session as any).line_items?.data?.[0];
      const priceId: string | undefined = line?.price?.id;
      const metaProduct = (session.metadata?.product || '') as string;

      if (metaProduct === 'RAMS' || metaProduct === 'CPP') {
        productLabel = metaProduct;
      } else if (priceId === process.env.STRIPE_PRICE_RAMs_ONEOFF) {
        productLabel = 'RAMS';
      } else if (priceId === process.env.STRIPE_PRICE_CPP_ONEOFF) {
        productLabel = 'CPP';
      } else {
        productLabel = 'Your product';
      }
    } catch (e) {
      // If retrieval fails, just show generic confirmation
      productLabel = 'Your product';
    }
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-4 pt-12">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full border border-white/10 bg-white/[.06] p-4 mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">You’re all set</h1>
            <p className="mt-2 text-sm text-white/70">
              {productLabel ? <>We’ve received your purchase of <b>{productLabel}</b>.</> : 'Your purchase is confirmed.'}
              {' '}Check your inbox for your access code and next steps.
            </p>

            <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-left">
                <div className="text-xs text-white/60">Email</div>
                <div className="mt-1 text-white/90">{email ?? '—'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-left">
                <div className="text-xs text-white/60">Product</div>
                <div className="mt-1 text-white/90">{productLabel ?? '—'}</div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-black hover:bg-white/90"
              >
                Return to Home
              </a>
            </div>

            <p className="mt-6 text-xs text-white/55">
              Didn’t get the email? Check your spam/promotions folder, or contact support.
            </p>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
