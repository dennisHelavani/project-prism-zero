
'use client';
import { SectionWrapper } from "./section-wrapper";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { AnimatedCounter } from "../ui/animated-counter";
import { LogoLoop } from '../ui/logo-loop';
import { MotionDiv } from "../ui/motion-div";

const techLogos = [
  { node: <p className="text-xl font-bold text-muted-foreground">Acme Rail</p>, title: "Acme Rail" },
  { node: <p className="text-xl font-bold text-muted-foreground">Tier 1 Build</p>, title: "Tier 1 Build" },
  { node: <p className="text-xl font-bold text-muted-foreground">CityWorks</p>, title: "CityWorks" },
  { node: <p className="text-xl font-bold text-muted-foreground">Northline</p>, title: "Northline" },
];

const chips = ["Used across UK projects", "Built with Tally + Make.com + OpenAI"];
const stats = [
    { value: 92, label: "Hours Saved", unit: "k" },
    { value: 99, label: "Compliance Rate", unit: "%" },
    { value: 12, label: "Drafts Generated", unit: "k" },
]

export function ProofSection() {
  return (
    <SectionWrapper id="proof" className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <MotionDiv>
          <div className="text-center lg:text-left">
              <h2 className="text-lg font-semibold leading-8 text-foreground mb-8">
                  Partners we work with
              </h2>
              <div style={{ height: '48px', position: 'relative', overflow: 'hidden'}}>
                <LogoLoop
                    logos={techLogos}
                    speed={80}
                    direction="left"
                    logoHeight={24}
                    gap={40}
                    pauseOnHover
                />
              </div>
              <div className="flex justify-center lg:justify-start flex-wrap gap-2 mt-8">
                  {chips.map(chip => (
                      <Badge key={chip} variant="secondary" className="text-xs">{chip}</Badge>
                  ))}
              </div>
          </div>
        </MotionDiv>
         <MotionDiv delay={0.2}>
          <div className="grid grid-cols-3 gap-px rounded-lg">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center">
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
        </MotionDiv>
      </div>
    </SectionWrapper>
  );
}
