
'use client';

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export function SectionWrapper({ children, className, id, style }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24 lg:py-32", className)}
      style={style}
    >
      {children}
    </section>
  )
}
