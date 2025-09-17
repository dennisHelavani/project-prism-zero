
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
import { Badge } from '../ui/badge';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';

const benefits = [
  {
    title: 'Instant draft generation',
    description: 'Answer a few questions; get comprehensive RAMS/CPP drafts fast.',
    icon: <Clock className="h-4 w-4 text-[#FABE2C]" />,
    image: '/images/instantdraftgeneration.png',
  },
  {
    title: 'Editable & compliant',
    description: 'Export to .doc for final tweaks; templates follow HSE/CDM guidance.',
    icon: <ClipboardList className="h-4 w-4 text-[#FABE2C]" />,
    image: '/images/editablecompliance.png',
  },
  {
    title: 'Always up-to-date',
    description: 'Prompts reflect current UK construction context.',
    icon: <ShieldCheck className="h-4 w-4 text-[#FABE2C]" />,
    image: '/images/uptodate.gif',
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
    image: '/images/branded.png'
  },
  {
    title: 'Email delivery (~3.5 min)',
    description: 'DOCX optional; owner BCC for traceability.',
    icon: <Share2 className="h-4 w-4 text-[#FABE2C]" />,
  },
];

const Skeleton = () => (
  <div className="flex h-full min-h-[6rem] w-full flex-1 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900" />
);

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
      
        <BentoGrid className="mx-auto auto-rows-[18rem] md:auto-rows-[20rem]">
          {benefits.map((item, i) => {
            const direction = i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'fade';
            const variant = direction === 'left' ? itemVariants.hiddenLeft : direction === 'right' ? itemVariants.hiddenRight : itemVariants.hiddenFade;

            const headerContent = item.image ? (
              <div className="relative flex h-full min-h-[6rem] w-full flex-1 rounded-xl overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized={item.image.endsWith('.gif')}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
            ) : (
              <Skeleton />
            );

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
                <BentoGridItem
                  title={item.title}
                  description={item.description}
                  header={headerContent}
                  className="md:col-span-1 h-full"
                  icon={item.icon}
                />
              </MotionDiv>
            )
          })}
        </BentoGrid>
      
      {/*
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
      */}
    </SectionWrapper>
  );
}
