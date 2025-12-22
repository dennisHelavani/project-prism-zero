'use client';

import { useState } from 'react';
import RAMSForm from '@/components/forms/RAMSForm';
import CPPForm from '@/components/forms/CPPForm';

export default function GenerateClient({
  email,
  code,
}: {
  email: string | null;
  code: string | null;
  ramsUrl?: string; // kept for backwards compatibility but no longer used
  cppUrl?: string;  // kept for backwards compatibility but no longer used
}) {
  const [choice, setChoice] = useState<'RAMS' | 'CPP' | null>(null);

  return (
    <div className="px-4 pb-20">
      <div className="mx-auto max-w-3xl text-center pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Generate your documents</h1>
        <p className="mt-3 text-white/70">Choose a document type. You're unlocked for this session.</p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setChoice('RAMS')}
            className={`rounded-lg px-4 py-2 ring-1 transition-colors ${choice === 'RAMS' ? 'bg-white text-black ring-white' : 'bg-white/5 text-white ring-white/10 hover:bg-white/10'
              }`}
          >
            RAMS
          </button>
          <button
            onClick={() => setChoice('CPP')}
            className={`rounded-lg px-4 py-2 ring-1 transition-colors ${choice === 'CPP' ? 'bg-white text-black ring-white' : 'bg-white/5 text-white ring-white/10 hover:bg-white/10'
              }`}
          >
            CPP
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        {!choice ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-white/70 text-center">
            Select RAMS or CPP to load the form.
          </div>
        ) : choice === 'RAMS' ? (
          <RAMSForm email={email} code={code} />
        ) : (
          <CPPForm email={email} code={code} />
        )}
      </div>
    </div>
  );
}
