'use client';
import { useState } from 'react';

type Product = 'RAMS' | 'CPP';

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState<Product>('CPP');
  const [busy, setBusy] = useState(false);

  async function buy() {
    setBusy(true);
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product }),
      });

      let payload: any = {};
      try { payload = await r.json(); } catch { /* ignore */ }

      if (!r.ok) {
        alert(payload?.error || `Checkout failed (${r.status})`);
        return;
      }
      if (!payload?.url) {
        alert('No checkout URL returned.');
        return;
      }
      window.location.href = payload.url;
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-8 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Buy Access (one-time)</h1>

      <label className="block">
        <span className="text-sm">Email</span>
        <input
          className="border p-2 rounded w-full"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={product === 'CPP'}
            onChange={() => setProduct('CPP')}
          />
          CPP (one-off)
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={product === 'RAMS'}
            onChange={() => setProduct('RAMS')}
          />
          RAMS (one-off)
        </label>
      </div>

      <button
        onClick={buy}
        disabled={!email || busy}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {busy ? 'Processing…' : 'Purchase'}
      </button>
    </main>
  );
}
