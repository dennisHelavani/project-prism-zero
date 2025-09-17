
'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function CardVisual({
  visual,
  className,
}: {
  visual?: { src: string; alt: string; type?: 'image' | 'gif'; priority?: boolean };
  className?: string;
}) {
  return (
    <div className={cn(
      'relative w-full rounded-xl overflow-hidden border border-white/8 bg-gradient-to-b from-white/2 to-white/0',
      'h-[220px] md:h-[240px] lg:h-[260px]',
      className
    )}>
      {visual?.src ? (
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover"
          priority={!!visual.priority}
          unoptimized={visual.type === 'gif'}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" aria-hidden />
      )}
    </div>
  );
}
