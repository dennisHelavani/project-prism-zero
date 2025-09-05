import { SectionWrapper } from "./section-wrapper";
import Image from "next/image";

export function OurStorySection() {
  return (
    <SectionWrapper id="our-story" className="bg-card rounded-xl shadow-e1">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">
            From the Ground Up
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hard Hat AI was born from first-hand frustration. Our founder, a former site manager, spent more time battling paperwork than managing projects. Endless revisions, compliance checks, and tedious documentation were the norms.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            We knew there had to be a better way. We envisioned a tool that could understand the nuances of construction projects and generate the necessary documents with precision and speed. That vision is now Hard Hat AI, your partner in reclaiming time and ensuring compliance.
          </p>
        </div>
        <div className="relative h-80 w-full">
          <Image
            src="https://picsum.photos/600/400"
            alt="Construction site planning"
            data-ai-hint="construction planning"
            fill
            className="rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
