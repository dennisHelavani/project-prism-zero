
import { SectionWrapper } from "./section-wrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { DataFlowVisual } from "./data-flow-visual";

const steps = [
  {
    title: "Tell us the basics",
    description: "Answer a few simple questions about your site and project scope. No prior expertise is needed.",
  },
  {
    title: "AI drafts your docs",
    description: "Our system generates compliant RAMS and CDM documents tailored to your specific inputs in seconds.",
  },
  {
    title: "Review & download",
    description: "Get editable Word (.doc) or PDF files, ready for final review and sharing with your team.",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center">
        <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">How It Works</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Generate your construction documents in three simple steps.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="flex flex-col overflow-hidden bg-card border-white/10 shadow-e1 rounded-xl p-6">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4 w-fit">
              Step {index + 1}
            </Badge>
            <CardHeader className="p-0">
              <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2 flex-grow">
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
            {index === 1 && (
              <div className="relative h-48 w-full flex items-center justify-center bg-transparent mt-4">
                <div className="rounded-xl border border-white/10 p-4">
                  <DataFlowVisual />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
