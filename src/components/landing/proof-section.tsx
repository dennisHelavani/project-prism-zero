
'use client';
import { SectionWrapper } from "./section-wrapper";
import { Badge } from "../ui/badge";

const partners = ["Acme Rail", "Tier 1 Build", "CityWorks", "Northline"];
const chips = ["Used across UK projects", "Built with Tally + Make.com + OpenAI"];

export function ProofSection() {
  return (
    <SectionWrapper id="proof" className="py-16">
      <div className="text-center">
        <h2 className="text-lg font-semibold leading-8 text-foreground mb-8">
            Partners we work with
        </h2>
        <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-4 md:gap-x-12">
            {partners.map(partner => (
                <p key={partner} className="text-xl font-bold text-muted-foreground">{partner}</p>
            ))}
        </div>
        <div className="flex justify-center flex-wrap gap-2 mt-8">
            {chips.map(chip => (
                <Badge key={chip} variant="secondary" className="text-xs">{chip}</Badge>
            ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
