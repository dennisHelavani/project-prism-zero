'use client';

type Props = {
  email: string;
  code: string;
  src: string;                 // full Tally URL with ?email=&code=
  product: 'RAMS' | 'CPP';
  expiresAtISO: string;        // ← NEW: ISO string from DB (e.g., 2025-11-08T00:00:00.000Z)
};

export default function AccessSingleForm({
  email,
  code,
  src,
  product,
  expiresAtISO,
}: Props) {
  // Format a date-only label in the user's locale (no time)
  let expiryLabel = '';
  try {
    const d = new Date(expiresAtISO);
    expiryLabel = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',  // e.g., Oct
      day: '2-digit',  // 09
    }).format(d);
  } catch {
    // if parsing fails, leave blank; UI will omit the date
  }

  return (
    <div className="space-y-4">
      {/* Details card (mobile-first) */}
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-sm">
        <p className="text-white/90">
          Code: <span className="font-mono tracking-widest">{code}</span>
        </p>
        <p className="text-white/60 truncate">Email: {email}</p>
        <p className="mt-1 text-xs text-white/50">
          Your code is single-use{expiryLabel ? <> and <b>expires on {expiryLabel}</b></> : ' and expires soon.'}
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-white text-center">
            {product} Form
          </h2>
          {/* Direct src so Tally loads reliably */}
          <iframe
            src={src}
            loading="eager"
            width="100%"
            className="rounded-2xl border border-white/10 bg-white min-h-[1000px] lg:min-h-[860px]"
            frameBorder="0"
            allow="clipboard-write *; clipboard-read *; fullscreen"
            title={`${product} Tally form`}
          />
        </div>
      </div>
    </div>
  );
}
