
import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";

export function CaseStudySection() {
  return (
    <SectionWrapper id="our-story" className="bg-card rounded-xl shadow-e1 scroll-m-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <MotionDiv>
          <div className="relative h-96 w-full lg:h-[500px]">
            <Image
              src="/images/aaronprofile.png"
              alt="Founder portrait"
              data-ai-hint="construction manager portrait"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover shadow-lg object-top"
            />
          </div>
        </MotionDiv>
        <MotionDiv delay={0.2}>
          <div className="text-center md:text-left">
            <BlurText
              as="h2"
              className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center md:justify-start"
              text="From the Ground Up"
            />
            <p className="mt-4 text-muted-foreground">
              On construction, rail, and infrastructure projects, safety documents like RAMS and CPP were slow to produce, inconsistent, and not truly site-specific. Time that should have gone to the build went into formatting, re-keying, and chasing edits.
            </p>
            <p className="mt-4 text-muted-foreground">
              Hard Hat AI combines on-site HSE experience with automation to create compliant drafts in minutes—editable, consistent, and genuinely useful on the ground. The result: clearer documents, fewer bottlenecks, and more time on site.
            </p>
            <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-muted-foreground">
              “RAMS used to take 2–3 hours—or the cost of a safety pro. Now it’s minutes at a fraction of the price. That’s Hard Hat AI.”
              <cite className="mt-2 block not-italic font-semibold text-foreground">— Aaron Lazenby, Founder & Chartered Health and Safety Professional (CMIOSH)</cite>
            </blockquote>
            <div className="mt-6">
              <h3 className="font-headline text-xl font-bold text-foreground">Why we’re different</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FABE2C] mt-1.5 shrink-0">●</span>
                    <span>Built by practitioners, not just technologists</span>
                  </li>
                   <li className="flex items-start gap-2">
                    <span className="text-[#FABE2C] mt-1.5 shrink-0">●</span>
                    <span>Tuned for UK HSE/CDM expectations</span>
                  </li>
                   <li className="flex items-start gap-2">
                    <span className="text-[#FABE2C] mt-1.5 shrink-0">●</span>
                    <span>Designed for real-world editing, reviews, and hand-off</span>
                  </li>
              </ul>
            </div>
          </div>
        </MotionDiv>
      </div>
    </SectionWrapper>
  );
}
