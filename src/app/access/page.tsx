'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AccessPage() {
  const router = useRouter();
  const qp = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoTried, setAutoTried] = useState(false);

  // Auto-validate if user lands via magic link: /access?email=..&code=..
  useEffect(() => {
    const qEmail = qp.get('email');
    const qCode = qp.get('code');

    if (!qEmail || !qCode || autoTried) return;

    // Pre-fill form and validate automatically
    setAutoTried(true);
    setEmail(qEmail);
    setCode(qCode.toUpperCase());
    setMsg('Validating your link…');
    setLoading(true);

    (async () => {
      try {
        const res = await fetch('/api/codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: qEmail, code: qCode }),
        });
        if (res.ok) {
          setMsg('Access granted. Redirecting…');
          router.replace('/generate');
        } else {
          const j = await res.json().catch(() => ({}));
          setMsg(j?.error || 'Invalid or expired link. You can try manually below.');
        }
      } catch (e) {
        setMsg('Network error. Try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [qp, autoTried, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        setMsg('Access granted. Redirecting…');
        router.replace('/generate');
      } else {
        const j = await res.json().catch(() => ({}));
        setMsg(j?.error || 'Invalid code');
      }
    } catch {
      setMsg('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-6"
      >
        <h1 className="text-2xl font-semibold text-white">Enter your monthly access code</h1>
        <p className="mt-2 text-sm text-white/60">
          Codes are emailed monthly. No account required.
        </p>

        {/* Status message (magic-link / manual) */}
        {msg && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            {msg}
          </div>
        )}

        <label className="mt-5 block text-sm text-white/80">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg bg-white/5 p-3 text-white outline-none ring-1 ring-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
        />

        <label className="mt-4 block text-sm text-white/80">Access code</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/5 p-3 text-white outline-none ring-1 ring-white/10 tracking-widest uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          autoComplete="one-time-code"
          inputMode="text"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Unlock'}
        </button>

        <div className="mt-4 text-center text-sm">
          <a
            href="/access/request"
            className="text-white/80 underline underline-offset-4 hover:text-white"
          >
            Don’t have a code? Email me a code
          </a>
        </div>
      </form>
    </div>
  );
}
