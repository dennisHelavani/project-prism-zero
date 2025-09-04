import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";

interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

export function CtaButton({ children, className, asChild = false, ...props }: CtaButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-white to-[#D9D9D9] px-[22px] py-[14px] font-semibold text-black shadow-soft-drop transition-all duration-300 ease-in-out",
        "hover:-translate-y-0.5 hover:shadow-e2 hover:from-white hover:to-[#ECECEC]",
        "active:translate-y-0 active:shadow-e1",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
