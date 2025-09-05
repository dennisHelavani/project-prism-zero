'use client';

import { useState } from 'react';
import { SectionWrapper } from './section-wrapper';
import { DocumentForm } from './document-form';
import { DocumentDisplay } from './document-display';
import type { GenerateHseCdmDocumentsOutput } from '@/ai/flows/generate-hse-cdm-documents';

export function CtaSection() {
  const [generatedDocs, setGeneratedDocs] = useState<GenerateHseCdmDocumentsOutput | null>(null);

  const handleSuccess = (data: GenerateHseCdmDocumentsOutput) => {
    setGeneratedDocs(data);
  };

  const handleReset = () => {
    setGeneratedDocs(null);
  };

  return (
    <SectionWrapper id="cta" className="bg-secondary rounded-xl shadow-e2 my-24">
      <div className="mx-auto max-w-3xl text-center">
        {!generatedDocs ? (
          <>
            <h2 className="font-headline text-4xl font-bold text-foreground md:text-5xl glowing-text">
              Ready to cut paperwork time?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Fill out the details below to generate your initial HSE & CDM documents. Our AI will create tailored drafts based on your project's needs.
            </p>
            <DocumentForm onSuccess={handleSuccess} />
          </>
        ) : (
          <DocumentDisplay documents={generatedDocs} onReset={handleReset} />
        )}
      </div>
    </SectionWrapper>
  );
}
