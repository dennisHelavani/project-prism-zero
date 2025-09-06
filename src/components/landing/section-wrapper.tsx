import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function SectionWrapper({ children, className, ...props }: SectionWrapperProps) {
  return (
    <section
      className={cn("mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24 lg:py-32", className)}
      {...props}
    >
      {children}
    </section>
  )
}
