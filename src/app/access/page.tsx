'use client';

import { useState } from 'react';

export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await fetch('/api/codes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    if (res.ok) {
      setMsg('Access granted. Redirecting…');
      window.location.href = '/generate';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j?.error || 'Invalid code');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-6">
        <h1 className="text-2xl font-semibold text-white">Enter your monthly access code</h1>
        <p className="mt-2 text-sm text-white/60">Codes are emailed monthly. No account required.</p>

        <label className="mt-5 block text-sm text-white/80">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg bg-white/5 p-3 text-white outline-none ring-1 ring-white/10"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />

        <label className="mt-4 block text-sm text-white/80">Access code</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/5 p-3 text-white outline-none ring-1 ring-white/10 tracking-widest uppercase"
          value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Unlock'}
        </button>

        {msg && <p className="mt-3 text-sm text-white/70">{msg}</p>}
      </form>
    </div>
  );
}
