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
  }
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
  'Branded output': {
    src: '/images/branded.png',
    alt: 'Branded document visual',
  },
  // Card 4 uses a custom animated component; we keep this only if you want a static fallback:
  'Always up-to-date': {
    src: '/images/calendar.png',
    alt: 'Up-to-date policy visual'
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
   Inline icons for the chips
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
   PROGRESS DIAL (click to animate 0→100)
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
   CARD 4: Animated calendar with orbiting rings
--------------------------------------------- */
function UpToDateOrbit({ iconSrc = '/images/calendar.png' }: { iconSrc?: string }) {
  return (
    <div className="relative grid place-items-center w-[min(80%,220px)] aspect-square">
      {/* Center icon (bigger, crisp) */}
      <Image
        src={iconSrc}
        alt="Calendar"
        width={92}
        height={92}
        className="relative z-10 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
      />

      {/* Orbit rings */}
      <div className="pointer-events-none absolute inset-0">
        {/* Rings (static circles) */}
        <div className="absolute inset-[10%] rounded-full border border-white/12" />
        <div className="absolute inset-[22%] rounded-full border border-white/10" />
        <div className="absolute inset-[34%] rounded-full border border-white/8" />

        {/* Rotating dot carriers (rotate the whole ring for smooth orbit) */}
        <div className="ring-carrier absolute inset-[10%] animate-[orbit_9s_linear_infinite]">
          <span className="dot" />
        </div>
        <div className="ring-carrier absolute inset-[22%] animate-[orbit_12s_linear_infinite_reverse]">
          <span className="dot dot--small" />
        </div>
        <div className="ring-carrier absolute inset-[34%] animate-[orbit_15s_linear_infinite]">
          <span className="dot dot--accent" />
        </div>
      </div>

      <style jsx>{`
        .ring-carrier { border-radius: 9999px; }
        .dot {
          position: absolute;
          top: -4px; /* top of the ring */
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #F6C84E;
          box-shadow: 0 0 10px rgba(246, 200, 78, 0.6);
        }
        .dot--small { width: 6px; height: 6px; opacity: 0.9; }
        .dot--accent {
          width: 7px; height: 7px;
          background: #7dd3fc; /* cyan accent */
          box-shadow: 0 0 10px rgba(125, 211, 252, 0.55);
        }

        @keyframes orbit {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------
   Split visual (ALWAYS 2 columns) with dynamic scaling
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
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const BASE = 720; // target width for full-size content
    const MIN = 0.6;
    const MAX = 1.0;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const s = Math.max(MIN, Math.min(MAX, w / BASE));
      setScale(s);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'grid grid-cols-2 items-stretch rounded-2xl overflow-hidden',
        'h-[clamp(180px,36vw,310px)]',
        'gap-[clamp(6px,1.4vw,12px)]',
        'bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.06)_0%,transparent_60%),radial-gradient(120%_100%_at_100%_0%,rgba(255,255,255,0.04)_0%,transparent_60%)]'
      )}
    >
      {/* LEFT (scaled) */}
      <div
        className="relative flex h-full items-center justify-center px-[clamp(4px,0.8vw,12px)]"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        {leftSlot ? (
          leftSlot
        ) : (
          left && (
            <Image
              src={left.src}
              alt={left.alt}
              width={300}
              height={300}
              className="h-auto max-h-[80%] max-w-[72%] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
              priority={!!left.priority}
              unoptimized={left.type === 'gif'}
            />
          )
        )}
      </div>

      {/* RIGHT (scaled) */}
      <div
        className="flex h-full flex-col justify-center px-[clamp(4px,0.8vw,12px)]"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        <div className="flex flex-col gap-[clamp(6px,1.2vw,10px)]">
          {rightLabels.map((label) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-xl border bg-white/[.04] border-white/[.08] text-neutral-200',
                'px-[clamp(10px,1.6vw,14px)] py-[clamp(6px,1.2vw,10px)]',
                'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-[2px] cursor-default'
              )}
            >
              <span className="text-neutral-300">{iconFor(label)}</span>
              <span className="text-[clamp(11px,1.2vw,14px)] leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Benefit card (no hover effects)
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
  const isUpToDate = title === 'Always up-to-date';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl cursor-default',
        'border border-white/10 bg-black/30',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]'
      )}
    >
      {/* Top: icon & title */}
      <div className="px-5 pt-4 md:px-6 md:pt-5">
        <div className="mb-3 flex items-center gap-2">
          {icon && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              {icon}
            </span>
          )}
          <h3 className="font-headline text-base md:text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>

      {/* Visual row */}
      <div className="relative w-full overflow-hidden rounded-3xl">
        {isFirst ? (
          <SplitVisual
            leftSlot={
              <div className="w-[min(78%,220px)] aspect-square">
                <ProgressDial color="#FABE2C" />
              </div>
            }
            rightLabels={rightLabels}
          />
        ) : isUpToDate ? (
          <SplitVisual
            leftSlot={<UpToDateOrbit iconSrc="/images/calendar.png" />}
            rightLabels={rightLabels}
          />
        ) : (
          <SplitVisual left={leftImage} rightLabels={rightLabels} />
        )}
      </div>

      {/* Description */}
      <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">
        <p className="text-[13px] leading-relaxed text-white/65 md:text-sm">{description}</p>
      </div>

      {/* Soft corner bloom */}
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
