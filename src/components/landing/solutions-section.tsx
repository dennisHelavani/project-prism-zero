
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Badge } from '../ui/badge';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import Image from 'next/image';

const steps = [
  {
    title: 'Fill in the form',
    description: 'Tell us the essentials—project scope, site conditions, and key risks. No jargon, no long questionnaire.',
    chips: ['2–3 key inputs', 'Site-specific'],
    visual: '/images/howitworksstep1.png',
    alt: 'A form being filled out for a construction project'
  },
  {
    title: 'Our AI assembles your draft',
    description: 'Our AI organizes your answers, matches hazards to proven controls, and applies your branding.',
    chips: ['Auto-mapping', 'HSE/CDM-aware', 'Brand applied'],
    visual: '/images/howitworksstep2.gif',
    alt: 'AI processing data to assemble a document'
  },
  {
    title: 'Receive your document',
    description: 'Branded PDF (DOCX optional) delivered to your inbox in ≈ 3.5 minutes.',
    chips: ['Filename standard', 'Owner BCC'],
    visual: '/images/howitworksstep2.png',
    alt: 'Visual representation of document delivery'
  },
];

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
                 <div className="my-4">
                    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg">
                      <Image
                          src={step.visual}
                          alt={step.alt || `Step ${index + 1} visual`}
                          data-ai-hint={index === 0 ? "form screenshot" : index === 1 ? "data processing abstract" : "document process"}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover"
                          unoptimized={step.visual.endsWith('.gif')}
                      />
                    </div>
                </div>
                <p className="flex-grow text-muted-foreground">{step.description}</p>
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
