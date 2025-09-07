import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import BlurText from "../ui/blur-text";
import { ClipboardEdit, Cpu, FileCheck2 } from "lucide-react";
import { CtaButton } from "../ui/cta-button";
import { StarBorder } from "../ui/star-border";
import Link from "next/link";
import { MotionDiv } from "../ui/motion-div";

const steps = [
  {
    step: 1,
    title: "Submit the short form",
    description: "Answer ~4 questions. We only send 2–3 AI inputs.",
    icon: <ClipboardEdit className="w-10 h-10 text-primary" />,
    chips: ["Tally on Framer", "Inputs: context • hazards • site"],
    note: "Company, email, and project ID populate the cover & email—not the AI.",
  },
  {
    step: 2,
    title: "Deterministic generation",
    description: "Make.com validates, then calls OpenAI with a JSON schema for consistent sectioning.",
    icon: <Cpu className="w-10 h-10 text-primary" />,
    chips: ["JSON schema", "Consistent sections"],
    note: "Sections: Cover → Exec Summary → Scope → Risks → Controls → Responsibilities → Emergency → Sign-off.",
  },
  {
    step: 3,
    title: "Receive your document",
    description: "Branded PDF (DOCX optional) delivered to your inbox in ≈ 60 s.",
    icon: <FileCheck2 className="w-10 h-10 text-primary" />,
    chips: ["Filename standard", "Owner BCC"],
    note: "Quick 1-question follow-up to improve quality.",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <MotionDiv>
        <div className="text-center max-w-4xl mx-auto">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="How it works (MVP)"
          />
          <p className="mt-4 text-lg text-muted-foreground">
            Short Tally form → Make.com automation → OpenAI → branded PDF by email (≈ 60 s)
          </p>
           <p className="mt-2 text-sm text-muted-foreground/80">
            GDPR-ready • Deterministic structure (JSON schema) • Branded output
          </p>
        </div>
      </MotionDiv>
      <MotionDiv delay={0.2}>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="flex flex-col bg-card border-white/10 shadow-e1 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="border-primary/50 text-primary w-fit">
                  Step {step.step}
                </Badge>
                {step.icon}
              </div>
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2 flex-grow">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
              <CardFooter className="p-0 mt-6 flex-col items-start gap-4">
                 <div className="flex flex-wrap gap-2">
                      {step.chips.map(chip => (
                          <Badge key={chip} variant="secondary" className="text-xs">{chip}</Badge>
                      ))}
                  </div>
                {step.note && <p className="text-xs text-muted-foreground/70">{step.note}</p>}
              </CardFooter>
            </Card>
          ))}
        </div>
      </MotionDiv>
       <MotionDiv delay={0.4}>
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
            <CtaButton asChild>
              <Link href="#upload">Try with your template</Link>
            </CtaButton>
            <StarBorder as={Link} href="#book-demo">
                Book a 15-min demo
            </StarBorder>
          </div>
       </MotionDiv>
    </SectionWrapper>
  );
}
