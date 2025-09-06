'use client';

import { useState } from 'react';
import { SectionWrapper } from './section-wrapper';
import { DocumentForm } from './document-form';
import { DocumentDisplay } from './document-display';
import type { GenerateHseCdmDocumentsOutput } from '@/ai/flows/generate-hse-cdm-documents';
import BlurText from '../ui/blur-text';

export function CtaSection() {
  const [generatedDocs, setGeneratedDocs] = useState<GenerateHseCdmDocumentsOutput | null>(null);

  const handleSuccess = (data: GenerateHseCdmDocumentsOutput) => {
    setGeneratedDocs(data);
  };

  const handleReset = () => {
    setGeneratedDocs(null);
  };

  return (
    <SectionWrapper id="cta" className="bg-secondary rounded-xl shadow-e2 my-12 md:my-24">
      <div className="mx-auto max-w-3xl text-center">
        {!generatedDocs ? (
          <>
            <BlurText
              as="h2"
              className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glowing-text justify-center"
              text="Ready to cut paperwork time?"
            />
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
