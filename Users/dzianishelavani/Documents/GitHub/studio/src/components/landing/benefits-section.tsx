
import React from 'react';
import Image from 'next/image';
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
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';
import { CardVisual } from './card-visual';

type CardItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual?: {
    src: string;
    alt: string;
    type?: 'image' | 'gif';
    priority?: boolean;
  };
};

const VISUALS: Record<string, CardItem['visual']> = {
  'Instant draft generation': {
    src: '/images/instantdraftgeneration.png',
    alt: 'Form becoming a finished RAMS/CPP draft',
    type: 'image',
    priority: true
  },
  'Editable & compliant': {
    src: '/images/editablecompliance.png',
    alt: 'DOC editor with compliance badge',
    type: 'image'
  },
  'Always up-to-date': {
    src: '/images/uptodate.gif',
    alt: 'Shield refresh and calendar flip indicating updated guidance',
    type: 'gif'
  },
  'Branded output': {
    src: '/images/branded.png',
    alt: 'Brand color and logo applied to a document template',
    type: 'image'
  }
};

const benefitData: Omit<CardItem, 'visual'>[] = [
  {
    title: 'Instant draft generation',
    description: 'Answer a few questions; get comprehensive RAMS/CPP drafts fast.',
    icon: <Clock className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Editable & compliant',
    description: 'Export to .doc for final tweaks; templates follow HSE/CDM guidance.',
    icon: <ClipboardList className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Always up-to-date',
    description: 'Prompts reflect current UK construction context.',
    icon: <ShieldCheck className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Deterministic structure',
    description: 'JSON-schema prompts keep sections and order consistent.',
    icon: <Fingerprint className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Branded output',
    description: 'Logo, colours, and footer applied automatically.',
    icon: <Palette className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Email delivery (~3.5 min)',
    description: 'DOCX optional; owner BCC for traceability.',
    icon: <Share2 className="h-4 w-4 text-[#FABE2C]" />,
  },
];

const benefits: CardItem[] = benefitData.map(item => ({
  ...item,
  visual: VISUALS[item.title],
}));

const itemVariants = {
    hiddenLeft: { opacity: 0, x: -50 },
    hiddenRight: { opacity: 0, x: 50 },
    hiddenFade: { opacity: 0, y: 50 },
    visible: { opacity: 1, x: 0, y: 0 }
};


export function BenefitsSection() {
  return (
    <SectionWrapper id="benefits">
        <MotionDiv>
            <div className="text-center mb-12 md:mb-16">
                <BlurText
                  as="h2"
                  className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
                  text="A New Era of Documentation"
                />
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Hard Hat AI transforms your compliance workflow, turning hours of tedious work into minutes of strategic review.
                </p>
            </div>
        </MotionDiv>
      
        <BentoGrid className="mx-auto auto-rows-auto">
          {benefits.map((item, i) => {
            const direction = i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'fade';
            const variant = direction === 'left' ? itemVariants.hiddenLeft : direction === 'right' ? itemVariants.hiddenRight : itemVariants.hiddenFade;

            return (
               <MotionDiv
                key={i}
                className={cn(i >= 4 ? 'hidden md:block' : '')}
                initial={variant}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.15 }}
                variants={{
                    visible: { opacity: 1, x: 0, y: 0 },
                    hiddenLeft: itemVariants.hiddenLeft,
                    hiddenRight: itemVariants.hiddenRight,
                    hiddenFade: itemVariants.hiddenFade
                }}
              >
                <div
                  className={cn(
                    "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-card justify-between flex flex-col space-y-4 border border-white/10 h-full"
                  )}
                >
                  <CardVisual visual={item.visual} />
                  <div className="group-hover/bento:translate-x-2 transition duration-200">
                    {item.icon}
                    <div className="font-headline font-bold text-foreground mb-2 mt-2">
                      {item.title}
                    </div>
                    <div className="font-sans font-normal text-muted-foreground text-xs">
                      {item.description}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )
          })}
        </BentoGrid>
    </SectionWrapper>
  );
}
