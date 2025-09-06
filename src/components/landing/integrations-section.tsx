
'use client';
import { SectionWrapper } from "./section-wrapper";
import { Share2, Zap, PenSquare, HardHat, Building } from "lucide-react";
import BlurText from "../ui/blur-text";

const integrations = [
  { node: <Share2 className="w-8 h-8 md:w-12 md:h-12"/>, title: "SharePoint" },
  { node: <Zap className="w-8 h-8 md:w-12 md:h-12"/>, title: "Power Automate" },
  { node: <PenSquare className="w-8 h-8 md:w-12 md:h-12"/>, title: "DocuSign" },
  { node: <HardHat className="w-8 h-8 md:w-12 md:h-12"/>, title: "Procore" },
  { node: <Building className="w-8 h-8 md:w-12 md:h-12"/>, title: "Autodesk" },
];

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations" className="py-16 bg-secondary rounded-xl">
      <div className="text-center">
        <BlurText
          as="h2"
          className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
          text="Integrations & Compliance"
        />
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect seamlessly with your existing tools and workflows.
        </p>
      </div>
      <div className="flex justify-center items-center flex-wrap gap-8 md:gap-12 mt-12">
        {integrations.map((logo) => (
          <div key={logo.title} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            {logo.node}
            <span className="font-semibold text-sm md:text-base">{logo.title}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>GDPR posture compliant • Based on HSE/CDM guidance • Supports custom naming/numbering standards</p>
      </div>
    </SectionWrapper>
  );
}
