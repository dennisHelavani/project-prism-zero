// app/access/forms/page.tsx
import PageShell from '@/components/layout/page-shell';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import AccessFormsClient from './AccessFormsClient';

const supabaseAdmin = getSupabaseAdmin();
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AccessForms({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams; // Next 15 requires awaiting
  const code = typeof sp.code === 'string' ? sp.code.toUpperCase() : '';

  const Message = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
      {children}
    </div>
  );

  if (!code) {
    return (
      <PageShell>
        <main className="mx-auto max-w-6xl px-4 pt-12">
          <Message>
            Missing code. Go back to <a className="underline" href="/access">/access</a>.
          </Message>
        </main>
      </PageShell>
    );
  }

  // Get the current code's data
  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return (
      <PageShell>
        <main className="mx-auto max-w-6xl px-4 pt-12">
          <Message>Invalid or unknown code.</Message>
        </main>
      </PageShell>
    );
  }

  // if (data.used) {
  //   return (
  //     <PageShell>
  //       <main className="mx-auto max-w-6xl px-4 pt-12">
  //         <Message>This code has already been used.</Message>
  //       </main>
  //     </PageShell>
  //   );
  // }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return (
      <PageShell>
        <main className="mx-auto max-w-6xl px-4 pt-12">
          <Message>This code has expired.</Message>
        </main>
      </PageShell>
    );
  }

  // Get ALL active codes for this email to determine full entitlements
  const { data: allCodes } = await supabaseAdmin
    .from('access_links')
    .select('product')
    .eq('email', data.email.toLowerCase())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString());

  const hasCPP = allCodes?.some((c) => c.product === 'CPP') ?? false;
  const hasRAMS = allCodes?.some((c) => c.product === 'RAMS') ?? false;
  const codeProduct: 'RAMS' | 'CPP' = data.product === 'RAMS' ? 'RAMS' : 'CPP';

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-4 pt-10 md:pt-12 pb-16 space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Submit your request</h1>
          <p className="mt-1 text-sm text-white/65">
            Select your document type and fill out the form below.
          </p>
        </div>

        <AccessFormsClient
          email={data.email}
          code={code}
          expiresAt={data.expires_at}
          codeProduct={codeProduct}
          hasCPP={hasCPP}
          hasRAMS={hasRAMS}
        />
      </main>
    </PageShell>
  );
}
