
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Badge } from '../ui/badge';
import { InstantGenerationVisual, EditableShareableVisual } from './solution-visuals';
import { DataFlowVisual } from './data-flow-visual';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';

const solutions = [
  {
    title: 'Fill in the form',
    description: 'Tell us the essentials—project scope, site conditions, and key risks. No jargon, no long questionnaire.',
    chips: ['2–3 key inputs', 'Site-specific'],
    visual: <DataFlowVisual />,
  },
  {
    title: 'Our AI assembles your draft',
    description: 'We map your answers to the right sections, match hazards to proven controls, and apply your branding automatically. The result is a clear, consistent RAMS/CPP draft ready for review.',
    chips: ['Auto-mapping', 'HSE/CDM-aware', 'Brand applied'],
    visual: <InstantGenerationVisual />,
  },
  {
    title: 'Receive your document',
    description: 'Branded PDF (DOCX optional) delivered to your inbox in ≈ 3.5 minutes.',
    chips: ['Filename standard', 'Owner BCC'],
    visual: <EditableShareableVisual />,
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <MotionDiv>
        <div className="mx-auto max-w-2xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground glowing-text justify-center"
            text="How it works"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From first input to final document in just a few minutes.
          </p>
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="mx-auto mt-16 grid max-w-none grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <Card key={solution.title} className="flex flex-col overflow-hidden bg-card border-white/10 shadow-e1 rounded-xl p-6">
               <Badge variant="outline" className="border-primary/50 text-primary mb-4 w-fit">
                  Step {index + 1}
              </Badge>
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl font-bold">{solution.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2 flex-grow">
                <p className="text-muted-foreground">{solution.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {solution.chips?.map((chip) => (
                    <Badge key={chip} variant="secondary">{chip}</Badge>
                  ))}
                </div>
              </CardContent>
               <div className="relative h-48 w-full flex items-center justify-center bg-transparent mt-4">
                {solution.visual}
              </div>
            </Card>
          ))}
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
