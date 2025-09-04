import React from 'react';
import {
  BentoGrid,
  BentoGridItem,
} from '@/components/ui/bento-grid';
import {
  ClipboardList,
  FileText,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { SectionWrapper } from './section-wrapper';

export function PillarsSection() {
  return (
    <SectionWrapper>
      <BentoGrid className="mx-auto md:auto-rows-[20rem]">
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

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`flex h-full min-h-[6rem] w-full flex-1 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 ${className}`}
  ></div>
);

const items = [
  {
    title: 'Documents in minutes',
    description:
      'RAMS, method statements and risk assessments generated fast.',
    header: <Skeleton />,
    className: 'md:col-span-2',
    icon: <FileText className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Editable outputs',
    description: 'Export DOCX/PDF and tweak with your site specifics.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <ClipboardList className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Built for compliance',
    description: 'CDM/HSE-aware templates and sensible defaults.',
    header: <Skeleton />,
    className: 'md:col-span-1',
    icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'Share & track',
    description: 'Simple handoff and version history (future feature).',
    header: <Skeleton />,
    className: 'md:col-span-2',
    icon: <Share2 className="h-4 w-4 text-neutral-500" />,
  },
];
