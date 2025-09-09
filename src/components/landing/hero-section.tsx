
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { StarBorder } from "../ui/star-border";
import { CtaButton } from "../ui/cta-button";
import { Card } from "../ui/card";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";

export function HeroSection() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8" id="hero">
        <div className="mx-auto max-w-7xl py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <MotionDiv>
            <div className="text-center lg:text-left">
              <BlurText
                as="h1"
                className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground sm:text-6xl glowing-text justify-center lg:justify-start"
                style={{lineHeight: 1.2}}
                text="Generate HSE & CDM documents in minutes—error-free."
              />
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                AI-powered editable documents, fully compliant and ready to send. Spend less time on paperwork and more on what matters—building.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <CtaButton asChild>
                  <Link href="#upload">Try with your template</Link>
                </CtaButton>
              </div>
               <p className="mt-6 text-sm text-muted-foreground">
                GDPR-ready • Deterministic structure (JSON schema) • Branded PDF via email (≈ 3.5 minutes)
              </p>
            </div>
          </MotionDiv>
          <MotionDiv delay={0.2}>
            <div className="flex justify-center">
               <Card className="p-4 bg-card/50 border-primary/20 max-w-md w-full">
                  <div className="aspect-video bg-secondary rounded-md flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-center font-bold mt-4 text-foreground">LIVE DEMO — Generate RAMS in 60s</p>
              </Card>
            </div>
          </MotionDiv>
        </div>
      </div>
  );
}
