
import { SectionWrapper } from "./section-wrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { DataFlowVisual } from "./data-flow-visual";
import BlurText from "../ui/blur-text";

const steps = [
  {
    title: "Ingest your template/spec",
    description: "Input: Word/Excel/PDF",
  },
  {
    title: "Map fields to your data source",
    description: "Generate: SharePoint, Procore",
    visual: <DataFlowVisual />,
  },
  {
    title: "Generate & route for approvals",
    description: "Download: Ready for e-sign",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center">
        <BlurText
          as="h2"
          className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
          text="How It Works"
        />
        <p className="mt-4 text-lg text-muted-foreground">
          A data-mapping flow that connects your documents to your systems.
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
             {step.visual && (
               <div className="relative h-48 w-full flex items-center justify-center bg-transparent mt-4 rounded-xl border border-white/10 p-4">
                  {step.visual}
              </div>
            )}
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
