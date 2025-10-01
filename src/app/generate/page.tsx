'use client';

import { useState } from 'react';

const RAMS_URL =
  process.env.NEXT_PUBLIC_TALLY_RAMs_URL ||
  (process.env.TALLY_RAMs_URL as string);

const CPP_URL =
  process.env.NEXT_PUBLIC_TALLY_CPP_URL ||
  (process.env.TALLY_CPP_URL as string);

export default function GeneratePage() {
  const [choice, setChoice] = useState<'RAMS' | 'CPP' | null>(null);

  return (
    <div className="px-4 pb-20">
      <div className="mx-auto max-w-3xl text-center pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Generate your documents
        </h1>
        <p className="mt-3 text-white/70">
          Choose a document type. You’re unlocked for this session.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setChoice('RAMS')}
            className={`rounded-lg px-4 py-2 ring-1 ${
              choice === 'RAMS'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white ring-white/10'
            }`}
          >
            RAMS
          </button>
          <button
            onClick={() => setChoice('CPP')}
            className={`rounded-lg px-4 py-2 ring-1 ${
              choice === 'CPP'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white ring-white/10'
            }`}
          >
            CPP
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        {!choice && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-white/70">
            Select RAMS or CPP to load the form.
          </div>
        )}

        {choice && (
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <iframe
              title={`${choice} form`}
              src={choice === 'RAMS' ? RAMS_URL : CPP_URL}
              className="h-[75vh] w-full bg-black"
              // Tally behaves best with these
              allow="fullscreen; clipboard-write; forms"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </div>
  );
}
