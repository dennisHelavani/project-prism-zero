import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";

export function CaseStudySection() {
  return (
    <SectionWrapper id="our-story" className="bg-card rounded-xl shadow-e1">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-80 w-full">
          <Image
            src="https://picsum.photos/600/401"
            alt="Construction site planning"
            data-ai-hint="construction planning"
            fill
            className="rounded-lg object-cover shadow-lg"
          />
        </div>
        <div>
          <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">
            From the Ground Up
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
           <strong>Before:</strong> A leading contractor spent 8 hours per RAMS document, facing a 40% rework rate due to inconsistencies.
          </p>
           <p className="mt-2 text-lg text-muted-foreground">
           <strong>After:</strong> With Hard Hat AI, document creation time dropped to 15 minutes, and reworks fell to under 5%.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            <strong>Why we built it:</strong> Hard Hat AI was born from first-hand frustration. Our founder, a former site manager, spent more time battling paperwork than managing projects. We knew there had to be a better way.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
