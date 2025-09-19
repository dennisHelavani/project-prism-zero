'use client';

import React from 'react';
import Image from 'next/image';
import { ClipboardList, ShieldCheck, Clock, Palette } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';

/* ---------------------------------------------
   CONTENT (keeps your copy & icons)
--------------------------------------------- */
const benefits = [
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
    title: 'Branded output',
    description: 'Logo, colours, and footer applied automatically.',
    icon: <Palette className="h-4 w-4 text-[#FABE2C]" />,
  },
];

/* ---------------------------------------------
   Left visual per card (use your assets in /public/images)
--------------------------------------------- */
const LEFT_VISUAL: Record<
  string,
  { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean }
> = {
  'Instant draft generation': {
    src: '/images/email.png',
    alt: 'Incoming email visual',
    priority: true,
  },
  'Editable & compliant': {
    src: '/images/editablecompliance.png',
    alt: 'Document editing compliance visual',
  },
  'Always up-to-date': {
    src: '/images/uptodate.gif',
    alt: 'Up-to-date policy visual',
    type: 'gif',
  },
  'Branded output': {
    src: '/images/branded.png',
    alt: 'Branded document visual',
  },
};

/* ---------------------------------------------
   Right chips per card (labels)
   (Updated for card #1 per your request)
--------------------------------------------- */
const CHIP_LABELS: Record<string, string[]> = {
  'Instant draft generation': [
    'Fill 4 quick fields',
    'Answer simple questions',
    'Submit in seconds',
    'AI drafts RAMS/CPP',
    'Email with .DOC/PDF',
  ],
  'Editable & compliant': [
    'HSE/CDM aligned',
    '.doc export',
    'Section mapping',
    'Review ready',
    'Audit-friendly',
  ],
  'Always up-to-date': [
    'Latest regs',
    'Template sync',
    'Auto notices',
    'Version tracking',
    'Change log',
  ],
  'Branded output': [
    'Logo applied',
    'Colours set',
    'Footer legal',
    'Header format',
    'File naming',
  ],
};

/* ---------------------------------------------
   Small SVG icons reused inside chips (inline)
--------------------------------------------- */
const Icons = {
  doc: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M21 12a9 9 0 1 1-18 0" />
      <path d="M12 12l5-3" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M14 7a4 4 0 1 0-5.657 5.657l8 8 3-3-8-8z" />
      <path d="M14 7l3 3" />
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};

function iconFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes('doc') || l.includes('email') || l.includes('audit') || l.includes('header') || l.includes('footer'))
    return Icons.doc;
  if (l.includes('mapping') || l.includes('template') || l.includes('format') || l.includes('fields'))
    return Icons.grid;
  if (l.includes('speed') || l.includes('latest') || l.includes('version') || l.includes('seconds'))
    return Icons.speed;
  if (l.includes('manual') || l.includes('logo') || l.includes('colours') || l.includes('answer'))
    return Icons.wrench;
  return Icons.repeat;
}

/* ---------------------------------------------
   Motion variants
--------------------------------------------- */
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

/* ---------------------------------------------
   Split visual used by ALL cards
--------------------------------------------- */
function SplitVisual({
  left,
  rightLabels,
}: {
  left: { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean };
  rightLabels: string[];
}) {
  return (
    <div
      className={cn(
        'grid max-[420px]:grid-cols-1 grid-cols-2 gap-3 h-full w-full rounded-2xl overflow-hidden',
        'bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.06)_0%,transparent_60%),radial-gradient(120%_100%_at_100%_0%,rgba(255,255,255,0.04)_0%,transparent_60%)]'
      )}
    >
      {/* LEFT image */}
      <div className="relative flex items-center justify-center p-0">
        <Image
          src={left.src}
          alt={left.alt}
          fill={false}
          width={260}
          height={260}
          className="max-w-[68%] h-auto drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] object-contain"
          priority={!!left.priority}
          unoptimized={left.type === 'gif'}
        />
      </div>

      {/* RIGHT chips */}
      <div className="flex flex-col gap-2.5 p-3">
        {rightLabels.map((label) => (
          <div
            key={label}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5',
              'bg-white/[.04] border border-white/[.08] text-neutral-200',
              'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-[2px]',
              'transition-colors duration-200 hover:bg-white/[.06] hover:border-white/[.12]'
            )}
          >
            <span className="text-neutral-300">{iconFor(label)}</span>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Benefit card: Top (icon+title) → Visual → Description
--------------------------------------------- */
function BenefitCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  const left = LEFT_VISUAL[title];
  const rightLabels = CHIP_LABELS[title] ?? [];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'border border-white/10 bg-black/30',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]',
        'transition-transform duration-300 ease-out will-change-transform hover:-translate-y-0.5'
      )}
    >
      {/* TOP: icon + title (keep spacing consistent) */}
      <div className="px-5 pt-5 md:px-6 md:pt-6">
        <div className="mb-3 flex items-center gap-2">
          {icon && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              {icon}
            </span>
          )}
          <h3 className="font-headline text-base md:text-lg font-semibold text-white">
            {title}
          </h3>
        </div>
      </div>

      {/* VISUAL */}
      <div className="px-5 md:px-6">
        <div className="relative w-full aspect-[16/10]">
          <SplitVisual left={left} rightLabels={rightLabels} />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="px-5 pb-5 pt-4 md:px-6 md:pb-6">
        <p className="text-[13px] leading-relaxed text-white/65 md:text-sm">
          {description}
        </p>
      </div>

      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[.04] blur-2xl" />
    </div>
  );
}

/* ---------------------------------------------
   Section wrapper (TITLE now matches "How it works")
--------------------------------------------- */
export function BenefitsSection() {
  return (
    <SectionWrapper id="benefits">
      <MotionDiv>
        <div className="mx-auto max-w-4xl text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground glowing-text justify-center"
            text="A New Era of Documentation"
          />
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Hard Hat AI transforms your compliance workflow, turning hours of
            tedious work into minutes of strategic review.
          </p>
        </div>
      </MotionDiv>

      {/* Grid: 2×2 on sm+ (1 col on xs), clamped to container */}
      <div className="mx-auto w-full max-w-6xl px-3 mt-10 md:mt-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
          {benefits.map((b, i) => (
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
              />
            </MotionDiv>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
