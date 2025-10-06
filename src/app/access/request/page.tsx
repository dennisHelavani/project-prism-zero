// src/app/access/request/page.tsx
'use client';
import { useState } from 'react';

export default function RequestCodePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch('/api/codes/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? 'sent' : 'error');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-white">
      <h1 className="text-2xl font-bold">Get your access code</h1>
      <p className="mt-2 text-white/70">
        We’ll email you a link to unlock document generation.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="you@company.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10 focus:outline-none"
        />
        <button
          disabled={status==='sending'}
          className="rounded-md bg-white text-black px-4 py-2"
        >
          {status==='sending' ? 'Sending...' : 'Email me a code'}
        </button>
      </form>
      {status==='sent' && <p className="mt-3 text-green-400">Check your inbox.</p>}
      {status==='error' && <p className="mt-3 text-red-400">Something went wrong.</p>}
    </div>
  );
}
