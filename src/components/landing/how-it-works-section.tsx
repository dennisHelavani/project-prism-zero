
'use client';

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
    title: "Fill in the form",
    description: "Tell us the essentials—project scope, site conditions, and key risks. No jargon, no long questionnaire.",
    icon: <ClipboardEdit className="w-10 h-10 text-primary" />,
    chips: ["2–3 key inputs", "Site-specific"],
  },
  {
    step: 2,
    title: "Our AI assembles your draft",
    description: "We map your answers to the right sections, match hazards to proven controls, and apply your branding automatically. The result is a clear, consistent RAMS/CPP draft ready for review.",
    icon: <Cpu className="w-10 h-10 text-primary" />,
    chips: ["Auto-mapping", "HSE/CDM-aware", "Brand applied"],
  },
  {
    step: 3,
    title: "Receive your document",
    description: "Branded PDF (DOCX optional) delivered to your inbox in ≈ 3.5 minutes.",
    icon: <FileCheck2 className="w-10 h-10 text-primary" />,
    chips: ["Filename standard", "Owner BCC"],
  },
];

const cardVariants = {
  hidden: { opacity: 0, rotateY: -180 },
  visible: { opacity: 1, rotateY: 0 }
};


export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="scroll-m-24">
      <MotionDiv>
        <div className="text-center max-w-4xl mx-auto">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="How it works (MVP)"
          />
          <p className="mt-4 text-lg text-muted-foreground">
            Short Tally form → Make.com automation → OpenAI → branded PDF by email (≈ 3.5 minutes)
          </p>
           <p className="mt-2 text-sm text-muted-foreground/80">
            GDPR-ready • Deterministic structure (JSON schema) • Branded output
          </p>
        </div>
      </MotionDiv>
      
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
             <MotionDiv
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="flex flex-col bg-card border-[#FABE2C]/50 shadow-e1 rounded-xl p-6 h-full" style={{ backfaceVisibility: 'hidden' }}>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="border-[#FABE2C] text-foreground w-fit">
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
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </div>
      
       <MotionDiv delay={0.4}>
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
            <CtaButton asChild>
              <Link href="#upload">Generate RAMS</Link>
            </CtaButton>
             <CtaButton asChild>
              <Link href="#upload">Generate CPP</Link>
            </CtaButton>
          </div>
       </MotionDiv>
    </SectionWrapper>
  );
}
