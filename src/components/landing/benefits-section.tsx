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
  KeyRound,
  GitBranch,
} from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { cn } from '@/lib/utils';

export function BenefitsSection() {
  return (
    <SectionWrapper id="benefits">
        <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text">A new era of documentation</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Hard Hat AI transforms your compliance workflow, turning hours of tedious work into minutes of strategic review.
            </p>
        </div>
      <BentoGrid className="mx-auto auto-rows-[18rem] md:auto-rows-[20rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={item.className}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </SectionWrapper>
  );
}

const Skeleton = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <div
    className={cn(
      `flex h-full min-h-[6rem] w-full flex-1 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900`,
      className
    )}
  >
      {children}
  </div>
);

const items = [
  {
    title: 'Instant Draft Generation',
    description:
      'Answer a few questions and our AI instantly generates comprehensive RAMS and CDM document drafts.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <Clock className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Editable & Compliant',
    description: 'Export to .doc and easily tweak the AI-generated content to fit your exact site specifics. All templates are based on HSE guidance.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <ClipboardList className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Always Up-to-Date',
    description: 'Our system is continuously updated to reflect the latest changes in UK construction regulations.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
  },
    {
    title: 'Version control & audit trail',
    description: 'Track changes, revert to previous versions, and maintain a complete audit trail for compliance.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <GitBranch className="h-4 w-4 text-neutral-500" />,
  },
    {
    title: 'Role-based permissions',
    description: 'Control who can view, edit, and approve documents with granular permissions.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <KeyRound className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Review & Collaborate',
    description: 'Share documents with your team for review and approval, ensuring everyone is on the same page (coming soon).',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <Share2 className="h-4 w-4 text-neutral-500" />,
  },
];
