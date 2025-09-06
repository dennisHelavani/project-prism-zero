import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";

export function CaseStudySection() {
  return (
    <SectionWrapper id="our-story" className="bg-card rounded-xl shadow-e1">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-96 w-full">
          <Image
            src="https://picsum.photos/600/800"
            alt="Founder portrait"
            data-ai-hint="construction manager portrait"
            fill
            className="rounded-lg object-cover shadow-lg object-top"
          />
        </div>
        <div>
          <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">
            From the Ground Up
          </h2>
          <p className="mt-4 text-muted-foreground">
            After more than a decade on construction sites, rail projects, and major infrastructure, Aaron Lazenby (CMIOSH) kept seeing the same drag on progress: safety documents—RAMS and Construction Phase Plans—were slow to produce, inconsistent between teams, and too often not truly site-specific. Time that should’ve gone to the build went into formatting, re-keying, and chasing edits.
          </p>
          <p className="mt-4 text-muted-foreground">
            Hard Hat AI was built to change that. We combine deep, on-site HSE experience with smart automation to create compliant drafts in minutes—editable, consistent, and genuinely useful on the ground. The result is a faster path from scope to safe work: clearer documents, fewer bottlenecks, and more time where it counts—on site.
          </p>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-muted-foreground">
            “RAMS used to take 2–3 hours—or the cost of a safety pro. Now it’s minutes at a fraction of the price. That’s Hard Hat AI.”
            <cite className="mt-2 block not-italic font-semibold text-foreground">— Aaron Lazenby, Founder & Chartered Health and Safety Professional (CMIOSH)</cite>
          </blockquote>
          <div className="mt-6">
            <h3 className="font-headline text-xl font-bold text-foreground">Why we’re different</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                <li>Built by practitioners, not just technologists.</li>
                <li>Tuned for UK HSE/CDM expectations.</li>
                <li>Designed for real-world editing, reviews, and hand-off.</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}