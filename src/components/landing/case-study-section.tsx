
import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";
import { Check } from "lucide-react";

export function CaseStudySection() {
  return (
    <SectionWrapper id="our-story" className="bg-card rounded-xl shadow-e1 scroll-m-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <MotionDiv>
          <div>
            <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">
              From the Ground Up
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              On construction, rail, and infrastructure projects, safety documents like RAMS and CPP were slow to produce, inconsistent, and not truly site-specific. Time that should have gone to the build went into formatting, re-keying, and chasing edits.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Hard Hat AI combines on-site HSE experience with automation to create compliant drafts in minutes—editable, consistent, and genuinely useful on the ground. The result: clearer documents, fewer bottlenecks, and more time on site.
            </p>
            <figure className="mt-6 border-l-4 border-primary pl-4">
              <blockquote className="text-foreground italic">
                <p>“RAMS used to take 2–3 hours—or the cost of a safety pro. Now it’s minutes at a fraction of the price. That’s Hard Hat AI.”</p>
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground">
                — Aaron Lazenby, Founder & Chartered Health and Safety Professional (CMIOSH)
              </figcaption>
            </figure>
            <div className="mt-8">
              <h3 className="font-headline text-xl font-bold text-foreground">Why we’re different</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Built by practitioners, not just technologists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Tuned for UK HSE/CDM expectations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Designed for real-world editing, reviews, and hand-off</span>
                </li>
              </ul>
            </div>
          </div>
        </MotionDiv>
        <MotionDiv delay={0.2}>
          <div className="relative h-96 w-full lg:h-[500px]">
            <Image
              src="/images/aaronprofile.png"
              alt="Founder of Hard Hat AI, Aaron Lazenby, on a construction site"
              data-ai-hint="construction manager portrait"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover shadow-lg object-top"
            />
          </div>
        </MotionDiv>
      </div>
    </SectionWrapper>
  );
}
