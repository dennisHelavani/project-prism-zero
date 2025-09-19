'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ClipboardList, ShieldCheck, Clock, Palette } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import BlurText from '../ui/blur-text';
import { MotionDiv } from '../ui/motion-div';
import { cn } from '@/lib/utils';

/* ---------------------------------------------
   CONTENT
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
    title: 'Branded output',
    description: 'Logo, colours, and footer applied automatically.',
    icon: <Palette className="h-4 w-4 text-[#FABE2C]" />,
  },
  {
    title: 'Always up-to-date',
    description: 'Prompts reflect current UK construction context.',
    icon: <ShieldCheck className="h-4 w-4 text-[#FABE2C]" />,
  },
];

/* ---------------------------------------------
   IMAGES for non-first cards
--------------------------------------------- */
const LEFT_VISUAL: Record<
  string,
  { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean }
> = {
  'Editable & compliant': {
    src: '/images/editablecompliance.png',
    alt: 'Document editing compliance visual',
  },
  'Always up-to-date': {
    src: '/images/calendar.png',
    alt: 'Up-to-date policy visual',
  },
  'Branded output': {
    src: '/images/branded.png',
    alt: 'Branded document visual',
  },
};

/* ---------------------------------------------
   CHIP LABELS (right-side table)
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
   Tiny SVGs for chip bullets
--------------------------------------------- */
const Icons = {
  doc: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M21 12a9 9 0 1 1-18 0" />
      <path d="M12 12l5-3" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M14 7a4 4 0 1 0-5.657 5.657l8 8 3-3-8-8z" />
      <path d="M14 7l3 3" />
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
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
   Progress dial (first card)
--------------------------------------------- */
function ProgressDial({
  size = 240,
  stroke = 6,
  color = '#FABE2C',
  track = 'rgba(255,255,255,0.12)',
  duration = 1300,
}: {
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  duration?: number;
}) {
  const [pct, setPct] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  const start = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(true);
    setPct(0);
    startRef.current = null;

    const tick = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(eased * 100);
      setPct(val);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const dashoffset = C * (1 - pct / 100);

  return (
    <button
      type="button"
      onClick={start}
      className={cn(
        'relative isolate grid place-items-center rounded-full outline-none select-none',
        !running && pct === 0 ? 'animate-[pulseDial_3.2s_ease-in-out_infinite]' : ''
      )}
      aria-label="Start instant draft generation"
      style={{ width: 'min(66%, 240px)', height: 'min(66%, 240px)' }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="block drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]" style={{ width: '100%', height: '100%' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={C}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-headline text-2xl font-bold text-white">{pct}%</div>
          <div className="mt-1 text-xs text-white/60">{running ? 'Generating…' : 'Click to generate'}</div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulseDial {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
      `}</style>
    </button>
  );
}

/* ---------------------------------------------
   UpToDateRings (FIXED: icon centered, rings rotate around it)
   ⚠️ Keyframes include translate + rotate so centering is preserved.
--------------------------------------------- */
function UpToDateRings({
  src,
  alt,
  iconScale = 0.62, // make the calendar large (0.55–0.7 works well)
}: {
  src: string;
  alt: string;
  iconScale?: number;
}) {
  return (
    <div className="grid h-full w-full place-items-center">
      {/* square stage that scales with available space */}
      <div className="relative aspect-square w-[86%] max-w-[340px] min-w-[180px]">
        {/* Centered big icon */}
        <Image
          src={src}
          alt={alt}
          width={512}
          height={512}
          className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          style={{ width: `${iconScale * 100}%`, height: 'auto' }}
          priority={false}
        />

        {/* Outer ring */}
        <div className="ring-cw absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/14 border-dashed">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[6px] border-x-transparent border-b-[10px] border-b-[#FABE2C] drop-shadow-[0_2px_8px_rgba(250,190,44,0.5)]" />
          </div>
        </div>

        {/* Middle ring */}
        <div className="ring-ccw absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-2 w-2 rounded-full bg-[#FABE2C] shadow-[0_0_10px_2px_rgba(250,190,44,0.35)]" />
          </div>
        </div>

        {/* Inner ring */}
        <div className="ring-cw-fast absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 border-dotted">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[5px] border-x-transparent border-b-[8px] border-b-white/70" />
          </div>
        </div>
      </div>

      {/* keyframes keep translate + rotate together */}
      <style jsx>{`
        @keyframes kf-ring-cw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes kf-ring-ccw {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to   { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .ring-cw      { animation: kf-ring-cw 18s linear infinite; }
        .ring-ccw     { animation: kf-ring-ccw 12s linear infinite; }
        .ring-cw-fast { animation: kf-ring-cw 9s  linear infinite; }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------
   Split visual container (equal heights, centered)
--------------------------------------------- */
function SplitVisual({
  left,
  leftSlot,
  rightLabels,
}: {
  left?: { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean };
  leftSlot?: React.ReactNode;
  rightLabels: string[];
}) {
  return (
    <div
      className={cn(
        'grid h-[230px] sm:h-[250px] md:h-[270px] lg:h-[290px] w-full grid-cols-2 gap-3 items-stretch',
        'rounded-2xl overflow-hidden max-[420px]:grid-cols-1',
        'bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.06)_0%,transparent_60%),radial-gradient(120%_100%_at_100%_0%,rgba(255,255,255,0.04)_0%,transparent_60%)]'
      )}
    >
      {/* LEFT cell */}
      <div className="relative my-auto flex h-full items-center justify-center">
        {leftSlot ? (
          leftSlot
        ) : (
          left && (
            <Image
              src={left.src}
              alt={left.alt}
              width={280}
              height={280}
              className="h-auto max-h-[80%] max-w-[70%] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
              priority={!!left.priority}
              unoptimized={left.type === 'gif'}
            />
          )
        )}
      </div>

      {/* RIGHT cell (chips) */}
      <div className="my-auto flex h-full flex-col justify-center gap-2.5 p-3">
        {rightLabels.map((label) => (
          <div
            key={label}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 cursor-default',
              'bg-white/[.04] border border-white/[.08] text-neutral-200',
              'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-[2px]'
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
   Benefit card (no hover transforms)
--------------------------------------------- */
function BenefitCard({
  index,
  title,
  description,
  icon,
}: {
  index: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  const leftImage = LEFT_VISUAL[title];
  const rightLabels = CHIP_LABELS[title] ?? [];
  const isFirst = index === 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl cursor-default',
        'border border-white/10 bg-black/30',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]'
      )}
    >
      <div className="px-5 pt-4 md:px-6 md:pt-5">
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

      <div className="relative w-full overflow-hidden rounded-3xl">
        {isFirst ? (
          <SplitVisual leftSlot={<ProgressDial color="#FABE2C" />} rightLabels={rightLabels} />
        ) : title === 'Always up-to-date' ? (
          <SplitVisual
            leftSlot={
              <UpToDateRings
                src={LEFT_VISUAL['Always up-to-date']?.src ?? '/images/calendar.png'}
                alt={LEFT_VISUAL['Always up-to-date']?.alt ?? 'Up-to-date policy visual'}
                iconScale={0.64} // tweak if you want the icon even larger/smaller
              />
            }
            rightLabels={rightLabels}
          />
        ) : (
          <SplitVisual left={leftImage} rightLabels={rightLabels} />
        )}
      </div>

      <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
        <p className="text-[13px] leading-relaxed text-white/65 md:text-sm">
          {description}
        </p>
      </div>

      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[.04] blur-2xl" />
    </div>
  );
}

/* ---------------------------------------------
   Section wrapper
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
            Hard Hat AI transforms your compliance workflow, turning hours of tedious work into minutes of strategic review.
          </p>
        </div>
      </MotionDiv>

      <div className="mx-auto mt-10 w-full max-w-6xl px-3 md:mt-14">
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
              <BenefitCard index={i} title={b.title} description={b.description} icon={b.icon} />
            </MotionDiv>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
