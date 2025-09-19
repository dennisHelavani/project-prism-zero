
import React from 'react';
import Image from 'next/image';
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

type CardItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual: {
    src: string;
    alt: string;
    'data-ai-hint': string;
    priority?: boolean;
  };
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

const benefits: CardItem[] = benefitData.map((item, i) => ({
  ...item,
  visual: {
    src: `https://picsum.photos/seed/${i + 2}/600/400`, // Start seed from 2 now
    alt: `Abstract visual for ${item.title}`,
    'data-ai-hint': 'abstract technology',
    priority: i < 3, // Prioritize loading for the first row of images
  },
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
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
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
                    <div className={cn(
                      'relative w-full rounded-xl overflow-hidden border border-white/8 bg-gradient-to-b from-white/2 to-white/0',
                      'h-[220px] md:h-[240px] lg:h-[260px]'
                    )}>
                        {i === 0 ? (
                          <div className="benefit-visual">
                            {/* LEFT: email PNG */}
                            <div className="bv-left">
                              <img src="/images/email.png" alt="Incoming email" />
                            </div>

                            {/* RIGHT: stacked checks */}
                            <div className="bv-right">
                              <div className="bv-chip">
                                <span className="bv-ico" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                                    <path d="M14 3v6h6"/>
                                  </svg>
                                </span>
                                <span>System check</span>
                              </div>

                              <div className="bv-chip">
                                <span className="bv-ico" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                                  </svg>
                                </span>
                                <span>Process check</span>
                              </div>

                              <div className="bv-chip">
                                <span className="bv-ico" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M21 12a9 9 0 1 1-18 0"/>
                                    <path d="M12 12l5-3"/>
                                  </svg>
                                </span>
                                <span>Speed check</span>
                              </div>

                              <div className="bv-chip">
                                <span className="bv-ico" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M14 7a4 4 0 1 0-5.657 5.657l8 8 3-3-8-8z"/>
                                    <path d="M14 7l3 3"/>
                                  </svg>
                                </span>
                                <span>Manual work</span>
                              </div>

                              <div className="bv-chip">
                                <span className="bv-ico" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M17 2l4 4-4 4"/>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                                    <path d="M7 22l-4-4 4-4"/>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                                  </svg>
                                </span>
                                <span>Repetitive task</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={item.visual.src}
                            alt={item.visual.alt}
                            data-ai-hint={item.visual['data-ai-hint']}
                            fill
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            className="object-cover"
                            priority={!!item.visual.priority}
                          />
                        )}
                    </div>
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
        </div>
    </SectionWrapper>
  );
}
