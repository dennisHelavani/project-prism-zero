
import type { LegalDoc } from '@/lib/legal/getLegalDocs';
import { format } from 'date-fns';

interface LegalContentProps {
  docs: LegalDoc[];
}

export function LegalContent({ docs }: LegalContentProps) {
  return (
    <div className="space-y-16">
      {docs.map((doc) => (
        <section key={doc.slug} id={doc.slug} className="scroll-m-24 md:scroll-m-20">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-bold text-foreground glowing-text">{doc.title}</h2>
            {doc.lastUpdated && (
              <p className="mt-2 text-sm text-muted-foreground">
                Last updated: {format(new Date(doc.lastUpdated), 'MMMM d, yyyy')}
              </p>
            )}
          </div>
          <div
            className="prose prose-invert max-w-none prose-headings:font-headline prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-accent prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </section>
      ))}
    </div>
  );
}
