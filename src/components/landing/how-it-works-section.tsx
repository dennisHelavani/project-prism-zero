
'use client';

import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import BlurText from "../ui/blur-text";
import { UploadCloud, BrainCircuit, ScanSearch, FileDown } from "lucide-react";
import { CtaButton } from "../ui/cta-button";
import Link from "next/link";
import { MotionDiv } from "../ui/motion-div";

const steps = [
  {
    step: 1,
    title: "Upload your spec",
    description: "Drop your template or scope. We auto-detect fields and project context.",
    icon: <UploadCloud className="w-10 h-10 text-primary" />,
    cta: { label: "Upload", href: "/#upload" },
  },
  {
    step: 2,
    title: "AI analyzes requirements",
    description: "We parse clauses, match compliance, and build a consistent structure.",
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    cta: { label: "See How", href: "#" },
  },
  {
    step: 3,
    title: "Instant draft & review",
    description: "Get an editable draft with highlighted variables and smart suggestions.",
    icon: <ScanSearch className="w-10 h-10 text-primary" />,
    cta: { label: "View Sample", href: "#" },
  },
  {
    step: 4,
    title: "Pay & download",
    description: "Secure checkout. Export clean PDF/DOCX instantly.",
    icon: <FileDown className="w-10 h-10 text-primary" />,
    cta: { label: "Generate my documents", href: "/#upload" },
  },
];

const cardVariants = {
  hidden: { opacity: 0, rotateY: -180 },
  visible: { opacity: 1, rotateY: 0 }
};


export function HowItWorksSection() {
  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        const header = document.getElementById("site-header");
        const offset = header ? header.offsetHeight + 24 : 96;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        history.replaceState(null, "", href);
      }
    }
  };

  return (
    <SectionWrapper id="how-it-works" className="scroll-m-24">
      <MotionDiv>
        <div className="text-center max-w-4xl mx-auto">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="How it works"
          />
          <p className="mt-4 text-lg text-muted-foreground">
            From spec to signature-ready document in four simple steps.
          </p>
        </div>
      </MotionDiv>
      
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
                   <CtaButton asChild>
                     <a href={step.cta.href} onClick={(e) => handleNavClick(step.cta.href, e as any)}>{step.cta.label}</a>
                   </CtaButton>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </div>
    </SectionWrapper>
  );
}
