import PageShell from '@/components/layout/page-shell';

export default async function AccessGate() {
  return (
    <PageShell>
      <main className="mx-auto max-w-xl px-4 pt-12">
        <div className="rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Enter your access code</h1>
            <p className="mt-2 text-sm text-white/65">
              Check your email for a 6-character code. Enter your email and the code below.
            </p>

            <form method="POST" action="/api/access/verify" className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm text-white/80">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm text-white/80">Access code</span>
                <input
                  name="code"
                  required
                  pattern="[A-Za-z0-9]{6}"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white tracking-widest uppercase placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="ABC123"
                />
              </label>

              <div className="pt-2">
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-black hover:bg-white/90"
                >
                  Continue
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-white/50">
              {/* This code expires in 7 days and can be used once. */}
            </p>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
