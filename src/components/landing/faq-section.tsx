
import { SectionWrapper } from "./section-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";

const faqs = [
  {
    question: "Can I use my own custom templates?",
    answer: "In MVP we use a standardized branded template. Uploading your own templates is planned for Phase 2.",
  },
  {
    question: "How do you handle legacy forms?",
    answer: "We map the MVP sections to a consistent structure. Contract- or client-specific forms are part of Phase 2.",
  },
  {
    question: "How does approval and e-signature work?",
    answer: "MVP delivers documents by email for review. E-signature and routing (e.g., DocuSign/SharePoint) are planned for Phase 2.",
  },
  {
    question: "Where is our data stored?",
    answer: "Form submissions are processed via Make.com and the output is emailed. Minimal run metadata is retained for troubleshooting and quality.",
  },
  {
    question: "What is the onboarding time?",
    answer: "Zero install. Submit the short form and you’ll typically receive your document within ~60 seconds.",
  },
  {
    question: "Who maintains data mappings?",
    answer: "Not required in MVP. Field mapping to systems like SharePoint/Procore arrives in Phase 2.",
  },
];


export function FaqSection() {
  return (
    <SectionWrapper id="faq" className="py-16 md:py-24">
      <MotionDiv>
        <div className="text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="Frequently Asked Questions"
          />
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="mt-12 md:mt-16 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
