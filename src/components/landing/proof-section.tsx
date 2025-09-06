
'use client';
import { SectionWrapper } from "./section-wrapper";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { AnimatedCounter } from "../ui/animated-counter";

const partners = ["Acme Rail", "Tier 1 Build", "CityWorks", "Northline"];
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
        <div className="text-center lg:text-left">
            <h2 className="text-lg font-semibold leading-8 text-foreground mb-8">
                Partners we work with
            </h2>
            <div className="flex justify-center lg:justify-start items-center flex-wrap gap-x-8 gap-y-4 md:gap-x-12">
                {partners.map(partner => (
                    <p key={partner} className="text-xl font-bold text-muted-foreground">{partner}</p>
                ))}
            </div>
            <div className="flex justify-center lg:justify-start flex-wrap gap-2 mt-8">
                {chips.map(chip => (
                    <Badge key={chip} variant="secondary" className="text-xs">{chip}</Badge>
                ))}
            </div>
        </div>
         <Card className="bg-transparent border-none shadow-none">
          <div className="grid grid-cols-3 gap-px rounded-lg bg-white/5 ring-1 ring-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card/80 px-4 py-6 rounded-lg">
                <p className="text-sm font-medium leading-6 text-muted-foreground">{stat.label}</p>
                <p className="mt-2 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    <AnimatedCounter from={0} to={stat.value} />
                    {stat.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SectionWrapper>
  );
}
