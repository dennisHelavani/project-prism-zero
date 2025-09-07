import React from 'react';
import {
  BentoGrid,
  BentoGridItem,
} from '@/components/ui/bento-grid';
import {
  ClipboardList,
  ShieldCheck,
  Share2,
  Clock,
  Fingerprint,
  Palette,
} from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { Badge } from '../ui/badge';
import { MotionDiv } from '../ui/motion-div';

const benefits = [
  {
    title: 'Instant draft generation',
    description: 'Answer a few questions; get comprehensive RAMS/CPP drafts fast.',
    icon: <Clock className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Editable & compliant',
    description: 'Export to .doc for final tweaks; templates follow HSE/CDM guidance.',
    icon: <ClipboardList className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Always up-to-date',
    description: 'Prompts reflect current UK construction context.',
    icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Deterministic structure',
    description: 'JSON-schema prompts keep sections and order consistent.',
    icon: <Fingerprint className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Branded output',
    description: 'Logo, colours, and footer applied automatically.',
    icon: <Palette className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Email delivery (~60 s)',
    description: 'DOCX optional; owner BCC for traceability.',
    icon: <Share2 className="h-4 w-4 text-neutral-500" />,
  },
];

const comingSoon = [
    "Version control & audit trail",
    "Role-based permissions",
    "In-app review & collaboration"
];

const Skeleton = () => (
  <div className="flex h-full min-h-[6rem] w-full flex-1 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900" />
);

export function BenefitsSection() {
  return (
    <SectionWrapper id="benefits">
        <MotionDiv>
            <div className="text-center mb-12 md:mb-16">
                <BlurText
                  as="h2"
                  className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
                  text="A new era of documentation"
                />
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Hard Hat AI transforms your compliance workflow, turning hours of tedious work into minutes of strategic review.
                </p>
            </div>
        </MotionDiv>
      <MotionDiv delay={0.2}>
        <BentoGrid className="mx-auto auto-rows-[18rem] md:auto-rows-[20rem]">
          {benefits.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={<Skeleton />}
              className="md:col-span-1"
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </MotionDiv>
      <MotionDiv delay={0.4}>
        <div className="text-center mt-12">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Coming Soon</h3>
          <div className="flex justify-center flex-wrap gap-2">
              {comingSoon.map(item => (
                  <Badge key={item} variant="secondary">{item}</Badge>
              ))}
          </div>
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
