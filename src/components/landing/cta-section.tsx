'use client';

import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { CtaButton } from '../ui/cta-button';
import { StarBorder } from '../ui/star-border';
import Link from 'next/link';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';


export function CtaSection() {
  return (
    <SectionWrapper id="cta-section" className="relative my-24 overflow-hidden py-24">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent blur-3xl opacity-50" />
      </div>

      <MotionDiv>
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-4xl font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Ready to <span className="text-primary">build better?</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground/80 md:text-xl leading-relaxed">
            Stop wrestling with formatting and start managing safety. Generate site-specific RAMS and CPPs in minutes, not hours.
          </p>
          <div className="mt-10 flex flex-col items-center gap-6">
            <Link href="#upload">
              <StarBorder as="button" className="text-xl font-semibold w-64 h-14" color="hsl(var(--primary))" speed="4s">
                <span className="flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </span>
              </StarBorder>
            </Link>


            <p className="mt-4 text-xs text-muted-foreground">
              AI-generated — review before use.
            </p>
          </div>
        </div>

      </MotionDiv>
    </SectionWrapper>
  );
}
