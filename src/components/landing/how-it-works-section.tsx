
'use client';

import Link from 'next/link';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionWrapper } from './section-wrapper';
import { Badge } from '../ui/badge';
import { FileUp, Cpu, FileCheck } from 'lucide-react';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import { CtaButton } from '../ui/cta-button';
import Visual1 from '@/images/howitworksstep1.png';

const steps = [
  {
    title: 'Fill in the form',
    description: 'Tell us the essentials—project scope, site conditions, and key risks.',
    chips: ['2–3 key inputs', 'Site-specific'],
    icon: <FileUp className="w-8 h-8 text-primary" />,
    visual: Visual1,
    alt: 'A form being filled out for a construction project'
  },
  {
    title: 'Our AI assembles your draft',
    description:
      'We map your answers to the right sections, match hazards to proven controls, and apply your branding automatically.',
    chips: ['Auto-mapping', 'HSE/CDM-aware', 'Brand applied'],
    icon: <Cpu className="w-8 h-8 text-primary" />
  },
  {
    title: 'Receive your document',
    description: 'Branded PDF (DOCX optional) delivered to your inbox in minutes.',
    chips: ['Filename standard', 'Owner BCC'],
    icon: <FileCheck className="w-8 h-8 text-primary" />
  }
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works">
      <MotionDiv>
        <div className="mx-auto max-w-4xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground glowing-text justify-center"
            text="How it works (MVP)"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Short Tally form → Make.com automation → OpenAI → branded PDF by email (≈ 3.5 minutes)
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            GDPR-ready • Deterministic structure (JSON schema) • Branded output
          </p>
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="mx-auto mt-16 grid max-w-none grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="flex flex-col overflow-hidden bg-card/80 border-primary/20 shadow-e1 rounded-xl p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <Badge variant="outline" className="w-fit border-primary/50 text-primary">
                  Step {index + 1}
                </Badge>
                {/* Hide icon if a visual is provided (Step 1) */}
                {!step.visual && step.icon}
              </div>

              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
              </CardHeader>
              
              {/* Visual block for steps that have one */}
              {step.visual && (
                <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                  {/* Use inline aspect-ratio to guarantee height even without Tailwind's plugin */}
                  <div className="relative w-full" style={{ aspectRatio: '16 / 10' }}>
                    <Image
                      src={step.visual}
                      alt={step.alt ?? step.title}
                      data-ai-hint="form screenshot"
                      fill
                      className="object-cover"
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      priority={index === 0}
                      placeholder="blur"
                    />
                  </div>
                </div>
              )}

              <CardContent className="mt-3 flex-grow p-0">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>

              <div className="mt-4 flex flex-wrap gap-2">
                {step.chips?.map((chip) => (
                  <Badge key={chip} variant="secondary">
                    {chip}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </MotionDiv>

      <MotionDiv delay={0.4}>
        <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
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
