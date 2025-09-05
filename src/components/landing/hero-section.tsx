import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { StarBorder } from "../ui/star-border";
import { CtaButton } from "../ui/cta-button";

export function HeroSection() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl" style={{lineHeight: 1.2}}>
              Generate HSE & CDM documents in minutes
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              AI-powered editable documents, fully compliant and ready to send. Spend less time on paperwork and more on what matters—building.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <CtaButton asChild>
                <Link href="#">Get started for free</Link>
              </CtaButton>
              <StarBorder as={Link} href="#">
                  <PlayCircle className="mr-2" />
                  Watch demo
              </StarBorder>
            </div>
          </div>
        </div>
      </div>
  );
}
