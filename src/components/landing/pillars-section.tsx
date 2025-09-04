import Image from "next/image";
import { SectionWrapper } from "./section-wrapper";
import { Card } from "@/components/ui/card";

const pillars = [
  {
    title: "Documents in minutes",
    desc: "RAMS, method statements and risk assessments generated fast.",
    media: "https://picsum.photos/600/400?random=1",
    aiHint: "document icons"
  },
  {
    title: "Editable outputs",
    desc: "Export DOCX/PDF and tweak with your site specifics.",
    media: "https://picsum.photos/600/400?random=2",
    aiHint: "editing software"
  },
  {
    title: "Built for compliance",
    desc: "CDM/HSE-aware templates and sensible defaults.",
    media: "https://picsum.photos/600/400?random=3",
    aiHint: "compliance checklist"
  },
  {
    title: "Share & track",
    desc: "Simple handoff and version history (future feature).",
    media: "https://picsum.photos/600/400?random=4",
    aiHint: "team collaboration"
  }
];

export function PillarsSection() {
  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="overflow-hidden bg-card border-white/10 shadow-e1 rounded-lg">
            <div className="p-8">
              <h3 className="font-headline text-2xl font-bold">{pillar.title}</h3>
              <p className="mt-2 text-muted-foreground">{pillar.desc}</p>
            </div>
            <Image
              src={pillar.media}
              alt={pillar.title}
              data-ai-hint={pillar.aiHint}
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
