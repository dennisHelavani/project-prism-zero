
'use client';

import { useState } from 'react';
import type { GenerateHseCdmDocumentsOutput } from '@/ai/flows/generate-hse-cdm-documents';
import { DocumentForm } from './document-form';
import { DocumentDisplay } from './document-display';
import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';

export function FormSection() {
  const [documents, setDocuments] = useState<GenerateHseCdmDocumentsOutput | null>(null);

  const handleFormSuccess = (data: GenerateHseCdmDocumentsOutput) => {
    setDocuments(data);
  };
  
  const handleReset = () => {
    setDocuments(null);
  };

  return (
    <SectionWrapper id="upload" className="bg-secondary rounded-xl shadow-e2 my-12 md:my-24">
      <div className="mx-auto max-w-3xl text-center">
        {documents ? (
          <DocumentDisplay documents={documents} onReset={handleReset}/>
        ) : (
          <>
            <BlurText
              as="h2"
              className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glowing-text"
              text="Generate Your Documents"
            />
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Fill out the form below to generate your RAMS and CDM documents. The more detail you provide, the better the result.
            </p>
            <DocumentForm onSuccess={handleFormSuccess} />
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
