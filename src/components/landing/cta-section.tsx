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
        {/* 3D grey plate wrapper */}
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-zinc-500/60 to-zinc-900/70 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
            {/* inner surface */}
            <div className="rounded-2xl bg-zinc-900/70 p-8 md:p-10 text-center
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.45)]">
              {/* subtle outer ring/edge highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />

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
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                AI-generated — review before use.
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
