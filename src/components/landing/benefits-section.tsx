'use client';

import React from 'react';
import Image from 'next/image';
import { ClipboardList, ShieldCheck, Clock, Palette } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------
   CONTENT: (keeps your existing titles & descriptions)
------------------------------------------------------------ */
const benefits = [
  {
    title: 'Instant draft generation',
    description:
      'Answer a few questions; get comprehensive RAMS/CPP drafts fast.',
    icon: <Clock className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Editable & compliant',
    description:
      'Export to .doc for final tweaks; templates follow HSE/CDM guidance.',
    icon: <ClipboardList className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Always up-to-date',
    description: 'Prompts reflect current UK construction context.',
    icon: <ShieldCheck className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Branded output',
    description: 'Logo, colours, and footer applied automatically.',
    icon: <Palette className="h-4 w-4 text-[#FABE2C]" />,
  },
];

/* ------------------------------------------------------------
   VISUALS: map titles to assets in /public/images/*
   (swap paths to your art; GIF stays animated)
------------------------------------------------------------ */
const VISUALS: Record<
  string,
  | { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean }
  | undefined
> = {
  'Instant draft generation': {
    src: '/images/instantdraftgeneration.png',
    alt: 'Form progressing into a finished RAMS/CPP draft',
    priority: true,
  },
  'Editable & compliant': {
    src: '/images/editablecompliance.png',
    alt: 'DOC editor with compliance badge',
  },
  'Always up-to-date': {
    src: '/images/uptodate.gif',
    alt: 'Calendar refresh indicating updated guidance',
    type: 'gif',
  },
  'Branded output': {
    src: '/images/branded.png',
    alt: 'Brand and logo applied to a template',
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------
   CurvedDivider – subtle arc line under the image (dark theme)
------------------------------------------------------------ */
function CurvedDivider() {
  return (
    <svg
      viewBox="0 0 400 38"
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-7 w-full"
      aria-hidden
    >
      <path
        d="M0,30 C80,10 320,10 400,30"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.25"
      />
    </svg>
  );
}

/* ------------------------------------------------------------
   Card – black/storm style to match your site
------------------------------------------------------------ */
function BenefitCard({
  title,
  description,
  icon,
  visual,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  visual?: { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean };
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'border border-white/10 bg-black/30',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]',
        'transition-transform duration-300 ease-out will-change-transform',
        'hover:-translate-y-0.5'
      )}
    >
      {/* VISUAL */}
      <div className="relative w-full aspect-[16/10]">
        {/* dark subtle backdrop in case image fails */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06),transparent_60%)]" />
        {visual?.src && (
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            className="object-cover mix-blend-normal"
            sizes="(min-width:1024px) 50vw, 100vw"
            priority={!!visual.priority}
            unoptimized={visual.type === 'gif'}
          />
        )}
        <CurvedDivider />
      </div>

      {/* BODY */}
      <div className="p-5 md:p-6">
        <div className="mb-1.5 flex items-center gap-2">
          {icon && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              {icon}
            </span>
          )}
          <h3 className="font-headline text-base md:text-lg font-semibold text-white">
            {title}
          </h3>
        </div>
        <p className="text-[13px] leading-relaxed text-white/65 md:text-sm">
          {description}
        </p>
      </div>

      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[.04] blur-2xl" />
    </div>
  );
}

/* ------------------------------------------------------------
   Section
------------------------------------------------------------ */
export function BenefitsSection() {
  return (
    <SectionWrapper id="benefits">
      <MotionDiv>
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="A New Era of Documentation"
          />
          <p className="mt-4 text-lg text-muted-foreground">
            Hard Hat AI transforms your compliance workflow, turning hours of
            tedious work into minutes of strategic review.
          </p>
        </div>
      </MotionDiv>

      {/* Grid: 2×2 on sm+ (1 col on xs) */}
      <div className="mx-auto w-full max-w-6xl px-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
          {benefits.map((b, i) => {
            const visual = VISUALS[b.title];
            return (
              <MotionDiv
                key={b.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                variants={itemVariants}
              >
                <BenefitCard
                  title={b.title}
                  description={b.description}
                  icon={b.icon}
                  visual={visual}
                />
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
