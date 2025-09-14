
'use client';

import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { CtaButton } from '../ui/cta-button';
import { StarBorder } from '../ui/star-border';
import Link from 'next/link';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';
import { WavyBackground } from '../ui/wavy-background';

export function CtaSection() {
  return (
    <SectionWrapper id="cta-section" className="my-12 md:my-24 !py-0 !px-0 relative overflow-hidden">
      <WavyBackground
        className="max-w-3xl mx-auto text-center flex flex-col items-center"
        containerClassName="h-auto"
        backgroundFill="hsl(var(--background))"
        waveWidth={80}
        colors={["#A3BFFA", "#7EA3F8", "#38bdf8", "#818cf8"]}
      >
        <MotionDiv>
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
        </MotionDiv>
      </WavyBackground>
    </SectionWrapper>
  );
}
