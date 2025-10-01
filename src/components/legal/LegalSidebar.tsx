
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { LegalDoc } from '@/lib/legal/getLegalDocs';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface LegalSidebarProps {
  docs: LegalDoc[];
}

export function LegalSidebar({ docs }: LegalSidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const clickRef = useRef(false);
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const getHeaderHeight = useCallback(() => {
    if (typeof window !== "undefined") {
      const header = document.querySelector("header");
      return header ? header.offsetHeight : 80;
    }
    return 80;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (clickRef.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio)) {
            bestEntry = entry;
          }
        }

        if (bestEntry && bestEntry.target instanceof HTMLElement) {
          setActiveSection(bestEntry.target.id);
        }
      },
      { rootMargin: `-${getHeaderHeight()}px 0px -55% 0px`, threshold: 0.1 }
    );

    observerRef.current = observer;

    const sections = docs
      .map((doc) => document.getElementById(doc.slug))
      .filter((el): el is HTMLElement => !!el);

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [docs, getHeaderHeight]);
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    clickRef.current = true;
    setActiveSection(slug);

    const targetElement = document.getElementById(slug);
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - getHeaderHeight();
        window.scrollTo({
            top: offsetTop,
            behavior: reducedMotion ? 'auto' : 'smooth',
        });
        history.pushState(null, '', `#${slug}`);
    }
    setTimeout(() => { clickRef.current = false }, reducedMotion ? 100 : 1000);
  };

  return (
    <nav aria-label="Legal navigation" className="sticky top-24">
      <div className="bg-card/80 border border-white/10 rounded-xl p-4">
        <h2 className="font-headline text-lg font-bold text-foreground mb-4 px-2">Legal</h2>
        <ul className="space-y-1">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <a
                href={`#${doc.slug}`}
                onClick={(e) => handleNavClick(e, doc.slug)}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white',
                  'relative',
                  {
                    'text-white bg-white/5': activeSection === doc.slug,
                  }
                )}
              >
                <span
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary transition-all",
                        activeSection === doc.slug ? "w-0.5" : "w-0"
                    )}
                />
                <span className="ml-2">{doc.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
