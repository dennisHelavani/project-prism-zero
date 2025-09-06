
import { SectionWrapper } from "./section-wrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";

const steps = [
  {
    title: "Ingest your template/spec",
    description: "Input: Word/Excel/PDF",
  },
  {
    title: "Map fields to your data source",
    description: "Generate: SharePoint, Procore",
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
        <h2 className="font-headline text-4xl font-bold text-foreground glowing-text">How It Works</h2>
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
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
