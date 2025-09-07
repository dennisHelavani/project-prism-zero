'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import type { GenerateHseCdmDocumentsOutput } from '@/ai/flows/generate-hse-cdm-documents';
import { useState } from 'react';
import BlurText from '../ui/blur-text';

interface DocumentDisplayProps {
  documents: GenerateHseCdmDocumentsOutput;
  onReset: () => void;
}

type CopiedState = 'rams' | 'cdm' | null;

export function DocumentDisplay({ documents, onReset }: DocumentDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<CopiedState>(null);

  const handleCopy = (docType: 'rams' | 'cdm', content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(docType);
    toast({
      title: 'Copied to clipboard!',
      description: `The ${docType.toUpperCase()} document has been copied.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Download Started',
      description: `${filename} is being downloaded.`,
    });
  };

  return (
    <div className="space-y-8 text-left">
      <div className="text-center">
        <BlurText
          as="h2"
          className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
          text="Your Documents Are Ready"
        />
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Review your generated documents below. You can copy the content or download them as .doc files for editing.
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl">Risk Assessment & Method Statement (RAMS)</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleCopy('rams', documents.ramsDocument)}>
              {copied === 'rams' ? <Check className="text-green-500" /> : <Copy />}
              <span className="sr-only">Copy RAMS document</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDownload('RAMS-Document.doc', documents.ramsDocument)}>
              <Download />
              <span className="sr-only">Download RAMS document</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="h-64 overflow-auto rounded-md border bg-background/50 p-4 font-code text-sm text-foreground whitespace-pre-wrap">{documents.ramsDocument}</pre>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl">Construction Design & Management (CDM)</CardTitle>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => handleCopy('cdm', documents.cdmDocument)}>
              {copied === 'cdm' ? <Check className="text-green-500" /> : <Copy />}
              <span className="sr-only">Copy CDM document</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDownload('CDM-Document.doc', documents.cdmDocument)}>
              <Download />
              <span className="sr-only">Download CDM document</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="h-64 overflow-auto rounded-md border bg-background/50 p-4 font-code text-sm text-foreground whitespace-pre-wrap">{documents.cdmDocument}</pre>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onReset}>
          <RotateCcw className="mr-2" />
          Generate New Documents
        </Button>
         <p className="mt-4 text-sm text-muted-foreground">
          Disclaimer: AI-generated documents require review by a qualified professional to ensure accuracy and compliance.
        </p>
      </div>
    </div>
  );
}
