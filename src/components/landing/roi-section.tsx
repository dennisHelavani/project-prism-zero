
'use client'

import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "./section-wrapper";
import { Check } from "lucide-react";
import BlurText from "../ui/blur-text";

const bullets = [
    "Fewer reworks through consistent structure",
    "Faster internal approvals with ready-to-send drafts",
    "Hours saved weekly on paperwork preparation"
];

export function RoiSection() {
  return (
    <SectionWrapper id="roi">
       <div className="text-center mb-12 md:mb-16">
            <BlurText
              as="h2"
              className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
              text="ROI Snapshot"
            />
        </div>
      <Card className="max-w-2xl mx-auto p-8 bg-secondary/50">
        <CardContent className="p-0">
          <ul className="space-y-4">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary mt-1 shrink-0" />
                <span className="text-lg text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
