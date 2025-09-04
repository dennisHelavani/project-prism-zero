import { SectionWrapper } from "./section-wrapper";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: "1",
    title: "Tell us the basics",
    description: "Answer a few simple questions about your site and project scope. No prior expertise is needed.",
  },
  {
    icon: "2",
    title: "AI drafts your docs",
    description: "Our system generates compliant RAMS and CDM documents tailored to your specific inputs in seconds.",
  },
  {
    icon: "3",
    title: "Review & download",
    description: "Get editable Word (.doc) or PDF files, ready for final review and sharing with your team.",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center">
        <h2 className="font-headline text-4xl font-bold text-foreground">How It Works</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Generate your construction documents in three simple steps.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="relative">
            <Card className="flex h-full flex-col gap-4 p-8 bg-card border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {step.icon}
              </div>
              <h3 className="font-headline text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
