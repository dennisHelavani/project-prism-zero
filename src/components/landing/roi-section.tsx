
'use client'

import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "./section-wrapper";
import { Check } from "lucide-react";
import BlurText from "../ui/blur-text";
import { AnimatedCounter } from "../ui/animated-counter";
import { MotionDiv } from "../ui/motion-div";

const bullets = [
    "Fewer reworks through consistent structure",
    "Faster internal approvals with ready-to-send drafts",
    "Hours saved weekly on paperwork preparation"
];

const metrics = [
    { value: 80, label: "Time Savings", unit:"%" },
    { value: 50, label: "Cost Reduction", unit:"%" },
    { value: 100, label: "Compliance Score", unit:"%" },
]

export function RoiSection() {
  return (
    <SectionWrapper id="roi">
       <MotionDiv>
        <div className="text-center mb-12 md:mb-16">
              <BlurText
                as="h2"
                className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glowing-text justify-center"
                text="ROI Snapshot"
              />
          </div>
        </MotionDiv>
      <MotionDiv delay={0.2} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
        <Card className="max-w-4xl mx-auto p-8 bg-secondary/50">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <CardContent className="p-0">
                  <ul className="space-y-4">
                      {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                          <Check className="w-6 h-6 text-green-500 mt-1 shrink-0" />
                          <span className="text-lg text-muted-foreground">{bullet}</span>
                      </li>
                      ))}
                  </ul>
              </CardContent>
              <div className="grid grid-cols-3 gap-4">
                  {metrics.map((stat) => (
                  <div key={stat.label} className="px-4 py-6 rounded-lg text-center">
                      <p className="mt-2 flex items-baseline justify-center gap-x-2">
                      <span className="text-4xl font-bold tracking-tight text-foreground glowing-text">
                          <AnimatedCounter from={0} to={stat.value} />
                          {stat.unit}
                      </span>
                      </p>
                      <p className="text-sm font-medium leading-6 text-muted-foreground">{stat.label}</p>
                  </div>
                  ))}
            </div>
          </div>
        </Card>
      </MotionDiv>
    </SectionWrapper>
  );
}
