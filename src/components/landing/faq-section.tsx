
import { SectionWrapper } from "./section-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Can I use my own custom templates?",
    answer: "Yes, our Growth and Scale plans allow you to ingest your own Word, Excel, or PDF templates. Our AI will map the fields to your data sources.",
  },
  {
    question: "How do you handle legacy forms?",
    answer: "We can digitize and integrate your legacy paper or PDF forms into the system, making them fully interactive and data-driven.",
  },
  {
    question: "How does the approval and e-signature process work?",
    answer: "You can define custom approval workflows. Once a document is approved, it can be routed for e-signature via our integrations with platforms like DocuSign.",
  },
  {
    question: "Where is our data stored?",
    answer: "Your data is securely stored in your chosen region to comply with data residency requirements like GDPR. We connect to your existing systems like SharePoint, we don't store your documents.",
  },
  {
    question: "What is the onboarding time?",
    answer: "For our Starter plan, you can get going in minutes. For Growth and Scale plans with custom templates, onboarding typically takes 3-5 business days.",
  },
  {
    question: "Who maintains the data mappings?",
    answer: "You have full control. Our intuitive interface allows your team to manage and update data mappings without needing IT support. We also provide full support.",
  },
];


export function FaqSection() {
  return (
    <SectionWrapper id="faq" className="py-16 md:py-24">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text">Frequently Asked Questions</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Answers to common questions about our platform.
        </p>
      </div>

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
    </SectionWrapper>
  );
}
