'use client';

import { useState } from 'react';

export default function TestPage() {
  const [email, setEmail] = useState('');
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function issue() {
    setLoading(true);
    setResp(null);
    const res = await fetch('/api/test/issue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, days: 30 }),
    });
    const j = await res.json();
    setResp(j);
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
        <h1 className="text-2xl font-semibold text-white">Local test: Issue code + magic link</h1>
        <input
          type="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg bg-white/5 p-3 text-white outline-none ring-1 ring-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={issue}
          disabled={!email || loading}
          className="w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Issuing…' : 'Issue code'}
        </button>

        {resp && (
          <div className="text-sm text-white/80 space-y-2">
            {'error' in resp ? (
              <div className="text-red-400">
                Error: {resp.error} {resp.detail && `– ${resp.detail}`}
              </div>
            ) : (
              <>
                <div>Code: <span className="font-mono">{resp.code}</span></div>
                <div>Expires: {new Date(resp.expiresAt).toLocaleString()}</div>
                <a
                  href={resp.magic}
                  className="inline-block rounded bg-white text-black px-3 py-2"
                >
                  Open magic link
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
