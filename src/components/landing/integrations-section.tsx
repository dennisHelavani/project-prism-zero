'use client';
import { SectionWrapper } from "./section-wrapper";
import { Share2, Zap, PenSquare, HardHat, Building } from "lucide-react";

const integrations = [
  { node: <Share2 size="48"/>, title: "SharePoint" },
  { node: <Zap size="48"/>, title: "Power Automate" },
  { node: <PenSquare size="48"/>, title: "DocuSign" },
  { node: <HardHat size="48"/>, title: "Procore" },
  { node: <Building size="48"/>, title: "Autodesk" },
];

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations" className="py-16 bg-secondary rounded-xl">
      <div className="text-center">
        <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">Integrations & Compliance</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect seamlessly with your existing tools and workflows.
        </p>
      </div>
      <div className="flex justify-center items-center flex-wrap gap-12 mt-12">
        {integrations.map((logo) => (
          <div key={logo.title} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            {logo.node}
            <span className="font-semibold">{logo.title}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>GDPR posture compliant • Based on HSE/CDM guidance • Supports custom naming/numbering standards</p>
      </div>
    </SectionWrapper>
  );
}
