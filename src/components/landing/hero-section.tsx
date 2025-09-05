import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { StarBorder } from "../ui/star-border";
import { CtaButton } from "../ui/cta-button";

export function HeroSection() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-white/10 hover:ring-white/20">
              Announcing our next round of funding.{' '}
              <a href="#" className="font-semibold text-foreground">
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
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
