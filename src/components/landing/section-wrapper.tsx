
'use client';

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { motion, type HTMLMotionProps } from "framer-motion";

interface SectionWrapperProps extends HTMLMotionProps<"section"> {
  children: ReactNode
}

export function SectionWrapper({ children, className, ...props }: SectionWrapperProps) {
  return (
    <motion.section
      className={cn("mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24 lg:py-32", className)}
      {...props}
    >
      {children}
    </motion.section>
  )
}
