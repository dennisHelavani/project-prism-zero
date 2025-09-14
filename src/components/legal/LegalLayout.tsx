
'use client';
import type { LegalDoc } from '@/lib/legal/getLegalDocs';
import { LegalSidebar } from './LegalSidebar';
import { LegalContent } from './LegalContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LegalLayoutProps {
  docs: LegalDoc[];
}

export function LegalLayout({ docs }: LegalLayoutProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text text-center mb-8">
          Legal Documents
        </h1>
        <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
                {docs.map(doc => (
                    <TabsTrigger key={doc.slug} value={doc.slug} asChild>
                        <a href={`#${doc.slug}`}>{doc.title}</a>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
        <LegalContent docs={docs} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <LegalSidebar docs={docs} />
        </div>
        <div className="lg:col-span-9 mt-12 lg:mt-0">
          <LegalContent docs={docs} />
        </div>
      </div>
    </div>
  );
}
