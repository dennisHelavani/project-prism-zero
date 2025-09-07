
'use client';
import { SectionWrapper } from "./section-wrapper";
import { Share2, Zap, PenSquare, HardHat, Building, Mail, BrainCircuit, ClipboardList } from "lucide-react";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";

const liveIntegrations = [
  { node: <ClipboardList className="w-8 h-8 md:w-12 md:h-12"/>, title: "Tally (form)" },
  { node: <Zap className="w-8 h-8 md:w-12 md:h-12"/>, title: "Make.com (automation)" },
  { node: <BrainCircuit className="w-8 h-8 md:w-12 md:h-12"/>, title: "OpenAI (drafting)" },
  { node: <Mail className="w-8 h-8 md:w-12 md:h-12"/>, title: "Email (delivery)" },
];

const plannedIntegrations = [
  { node: <Share2 className="w-8 h-8 md:w-12 md:h-12"/>, title: "SharePoint" },
  { node: <Zap className="w-8 h-8 md:w-12 md:h-12"/>, title: "Power Automate" },
  { node: <PenSquare className="w-8 h-8 md:w-12 md:h-12"/>, title: "DocuSign" },
  { node: <HardHat className="w-8 h-8 md:w-12 md:h-12"/>, title: "Procore" },
  { node: <Building className="w-8 h-8 md:w-12 md:h-12"/>, title: "Autodesk" },
];

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations" className="py-16 rounded-xl" style={{
      background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--secondary)))",
    }}>
      <MotionDiv>
        <div className="text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glowing-text justify-center"
            text="Integrations & Compliance"
          />
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="mt-12 text-center">
            <div className="flex justify-center items-center flex-wrap gap-8 md:gap-12">
              {liveIntegrations.map((logo) => (
                <div key={logo.title} className="flex flex-col items-center gap-2 text-foreground">
                  {logo.node}
                  <span className="font-semibold text-sm md:text-base">{logo.title}</span>
                </div>
              ))}
            </div>
        </div>
      </MotionDiv>
      
      <MotionDiv delay={0.4}>
        <div className="mt-16 text-center">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Planned</h3>
          <div className="flex justify-center items-center flex-wrap gap-8 md:gap-12 mt-8">
            {plannedIntegrations.map((logo) => (
              <div key={logo.title} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                {logo.node}
                <span className="font-semibold text-sm md:text-base">{logo.title}</span>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>

      <MotionDiv delay={0.6}>
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>GDPR posture • Based on HSE/CDM guidance • Supports custom naming/numbering standards</p>
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
