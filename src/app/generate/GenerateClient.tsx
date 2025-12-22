'use client';

import { useState } from 'react';
import RAMSForm from '@/components/forms/RAMSForm';
import CPPForm from '@/components/forms/CPPForm';
import { ProductSwitcher, useLastProduct, type Product } from '@/components/forms/ProductSwitcher';

export default function GenerateClient({
  email,
  code,
  hasCPP = true,
  hasRAMS = true,
  defaultProduct,
}: {
  email: string | null;
  code: string | null;
  /** Whether user has CPP access - defaults to true for session-based /generate route */
  hasCPP?: boolean;
  /** Whether user has RAMS access - defaults to true for session-based /generate route */
  hasRAMS?: boolean;
  /** Which product to default to */
  defaultProduct?: Product;
}) {
  const lastProduct = useLastProduct();

  // Determine initial selection
  const getInitialProduct = (): Product | null => {
    // If neither product available, return null
    if (!hasCPP && !hasRAMS) return null;
    // If only one product available, use it
    if (hasCPP && !hasRAMS) return 'CPP';
    if (hasRAMS && !hasCPP) return 'RAMS';
    // If specific default requested
    if (defaultProduct) return defaultProduct;
    // Use localStorage preference
    if (lastProduct) return lastProduct;
    // Default to CPP
    return 'CPP';
  };

  const [choice, setChoice] = useState<Product | null>(getInitialProduct);

  return (
    <div className="px-4 pb-20">
      <div className="mx-auto max-w-3xl text-center pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Generate your documents</h1>
        <p className="mt-3 text-white/70">
          {hasCPP && hasRAMS
            ? "Choose a document type. You're unlocked for this session."
            : hasCPP || hasRAMS
              ? "You're unlocked for this session."
              : 'Please purchase access to generate documents.'}
        </p>

        {(hasCPP || hasRAMS) && (
          <div className="mt-6">
            <ProductSwitcher
              hasCPP={hasCPP}
              hasRAMS={hasRAMS}
              selected={choice ?? 'CPP'}
              onSelect={setChoice}
            />
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        {!choice ? (
          <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-white/70 text-center">
            {hasCPP || hasRAMS
              ? 'Select a document type to load the form.'
              : 'You need to purchase access to generate documents.'}
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
