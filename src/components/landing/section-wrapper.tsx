
'use client';

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { motion } from "framer-motion";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function SectionWrapper({ children, className, ...props }: SectionWrapperProps) {
  return (
    <motion.section
      className={cn("mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24 lg:py-32", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.section>
  )
}
