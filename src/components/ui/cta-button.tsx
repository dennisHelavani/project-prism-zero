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
        "inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-white to-[#A9A9A9] px-[22px] py-2.5 font-semibold text-black shadow-soft-drop transition-all duration-300 ease-in-out text-sm",
        "hover:-translate-y-0.5 hover:shadow-e2 hover:from-white hover:to-[#C0C0C0]",
        "active:translate-y-0 active:shadow-e1",
        "disabled:pointer-events-none disabled:opacity-50",
        "flip-text-wrapper",
        className
      )}
      {...props}
    >
      <div className="flip-text-inner flex items-center justify-center gap-3">
        {children}
      </div>
    </Comp>
  );
}
