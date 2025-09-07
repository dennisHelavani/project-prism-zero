'use client';

import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { CtaButton } from '../ui/cta-button';
import { StarBorder } from '../ui/star-border';
import Link from 'next/link';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';

export function CtaSection() {
  return (
    <SectionWrapper id="cta-section" className="my-12 md:my-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className={cn(
            'absolute inset-0 bg-secondary bg-opacity-50',
            'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.2),rgba(255,255,255,0))]'
          )}
        />
      </div>
      <MotionDiv>
        <div className="mx-auto max-w-3xl text-center">
            <>
              <BlurText
                as="h2"
                className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
                text="Ready to cut paperwork time?"
              />
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Generate a RAMS or CPP draft with your details and receive a branded PDF by email in about a minute.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <CtaButton asChild>
                      <Link href="#upload">Try with your template</Link>
                  </CtaButton>
                  <StarBorder asChild>
                      <Link href="#contact">Book a 15-min demo</Link>
                  </StarBorder>
              </div>
               <p className="mt-4 text-xs text-muted-foreground">
                  AI-generated — review before use.
              </p>
            </>
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
