"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import Link, { type LinkProps } from "next/link";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Two modes:
 * - Button mode (default): renders <button> with all your styles.
 * - Link mode: if `href` is provided, renders Next.js <Link> with the same styles.
 *
 * You can still use `asChild` to style any child element (e.g., an external <a> or custom component).
 */

type ButtonModeProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;            // no href in button mode
  prefetch?: never;
  replace?: never;
  scroll?: never;
  shallow?: never;
};

type LinkModeProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Pick<LinkProps, "href" | "prefetch" | "replace" | "scroll" | "shallow">;

export type CtaButtonProps = (ButtonModeProps | LinkModeProps) & {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
};

export function CtaButton({
  children,
  className,
  asChild = false,
  ...props
}: CtaButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-white to-[#A9A9A9] px-[22px] py-2.5 font-semibold text-black shadow-soft-drop transition-all duration-300 ease-in-out text-sm",
    "hover:-translate-y-0.5 hover:shadow-e2 hover:from-white hover:to-[#C0C0C0]",
    "active:translate-y-0 active:shadow-e1",
    "disabled:pointer-events-none disabled:opacity-50",
    "flip-text-wrapper",
    className
  );

  // ---- Link mode (when href is provided) ----
  if ("href" in props && props.href !== undefined) {
    const { href, prefetch = false, replace, scroll, shallow, ...anchorRest } =
      props as LinkModeProps;

    // If caller still wants to use `asChild` in link mode, allow it
    if (asChild) {
      return (
        <Slot className={classes}>
          <div className="flip-text-inner flex items-center justify-center gap-3">
            {children}
          </div>
        </Slot>
      );
    }

    return (
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        className={classes}
        {...anchorRest}
      >
        <div className="flip-text-inner flex items-center justify-center gap-3">
          {children}
        </div>
      </Link>
    );
  }

  // ---- Button mode (default) ----
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={classes} {...(props as ButtonModeProps)}>
      <div className="flip-text-inner flex items-center justify-center gap-3">
        {children}
      </div>
    </Comp>
  );
}
