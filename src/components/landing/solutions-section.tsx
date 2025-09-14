
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Badge } from '../ui/badge';
import { ArrowRight, FileCheck } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Visual1 from '@/images/howitworksstep1.png';

const steps = [
  {
    title: 'Fill in the form',
    description: 'Tell us the essentials—project scope, site conditions, and key risks. No jargon, no long questionnaire.',
    chips: ['2–3 key inputs', 'Site-specific'],
    visual: Visual1,
    alt: 'A form being filled out for a construction project'
  },
  {
    title: 'Our AI assembles your draft',
    description: 'Our AI organizes your answers, matches hazards to proven controls, and applies your branding.',
    chips: ['Auto-mapping', 'HSE/CDM-aware', 'Brand applied'],
  },
  {
    title: 'Receive your document',
    description: 'Branded PDF (DOCX optional) delivered to your inbox in ≈ 3.5 minutes.',
    chips: ['Filename standard', 'Owner BCC'],
    visual: "https://picsum.photos/seed/step3/600/440",
    alt: 'Document being delivered to an inbox'
  },
];

const processItems = [
    { text: 'Map answers', result: 'right sections' },
    { text: 'Match hazards', result: 'proven controls' },
    { text: 'Apply branding', result: 'automatically' },
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export function SolutionsSection() {
  return (
    <SectionWrapper id="how-it-works">
      <MotionDiv>
        <div className="mx-auto max-w-4xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground glowing-text justify-center"
            text="Smart tools for faster safety & compliance"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our AI-powered agents qualify risks, handle compliance checks, and generate documents instantly.
          </p>
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="mx-auto mt-16 grid max-w-none grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="flex flex-col overflow-hidden bg-card/80 border-primary/20 shadow-e1 rounded-xl p-6">
               <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="border-[#FABE2C] text-white w-fit">
                    Step {index + 1}
                </Badge>
              </div>
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2 flex-grow flex flex-col">
                <div className="flex-grow my-4">
                  {(index === 0 || index === 2) && step.visual && (
                     <div className="relative w-full aspect-[16/11] rounded-lg overflow-hidden">
                        <Image
                            src={step.visual}
                            alt={step.alt || `Step ${index + 1} visual`}
                            data-ai-hint={index === 0 ? "form screenshot" : "document email"}
                            fill
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                  )}
                  {index === 1 && (
                      <div className="flex-grow flex flex-col justify-center space-y-4">
                          <h4 className="font-semibold text-foreground mb-2">Process</h4>
                          <div className="space-y-2">
                              {processItems.map((item, i) => (
                                  <motion.div
                                      key={item.text}
                                      custom={i}
                                      initial="hidden"
                                      whileInView="visible"
                                      viewport={{ once: true, amount: 0.5 }}
                                      variants={itemVariants}
                                      className="flex items-center text-sm"
                                  >
                                      <span>{item.text}</span>
                                      <ArrowRight className="w-4 h-4 mx-2 text-primary" />
                                      <span className="text-muted-foreground">{item.result}</span>
                                  </motion.div>
                              ))}
                          </div>
                      </div>
                  )}
                </div>

                <p className="text-muted-foreground">{step.description}</p>
                 {index === 1 && (
                    <div>
                        <h4 className="font-semibold text-foreground mb-2 mt-4">Result</h4>
                         <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { delay: 0.8 } }
                            }}
                            className="flex items-start gap-2 p-3 rounded-md bg-green-900/20 border border-green-500/30 text-sm"
                        >
                            <FileCheck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-green-300">Clear, consistent RAMS/CPP draft ready for review</span>
                        </motion.div>
                    </div>
                 )}
              </CardContent>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.chips?.map((chip) => (
                  <Badge key={chip} variant="secondary">{chip}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
