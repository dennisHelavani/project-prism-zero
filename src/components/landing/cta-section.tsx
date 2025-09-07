'use client';

import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { CtaButton } from '../ui/cta-button';
import { StarBorder } from '../ui/star-border';
import Link from 'next/link';
import { MotionDiv } from '../ui/motion-div';

export function CtaSection() {
  return (
    <SectionWrapper id="contact" className="bg-secondary rounded-xl shadow-e2 my-12 md:my-24 border border-[#FABE2C]">
      <MotionDiv>
        <div className="mx-auto max-w-3xl text-center">
            <>
              <BlurText
                as="h2"
                className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glowing-text justify-center"
                text="Ready to cut paperwork time?"
              />
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Generate a RAMS or CPP draft with your details and receive a branded PDF by email in about a minute.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <CtaButton asChild>
                      <Link href="#upload">Try with your template</Link>
                  </CtaButton>
                  <StarBorder as={Link} href="#book-demo">
                      Book a 15-min demo
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
