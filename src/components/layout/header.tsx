'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CtaButton } from "../ui/cta-button";

const navLinks = [
  { name: "Our story", href: "#our-story" },
  { name: "Pricing", href: "#" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact Us", href: "#" },
];

const HardHatLogo = () => (
  <div className="flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-foreground"
    >
      <path d="M2 13a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H2Z" />
      <path d="M5.25 6.52A8 8 0 0 1 12 4c1.47 0 2.87.4 4.1 1.12" />
      <path d="M12 4c0 2.21 1.79 4 4 4s4-1.79 4-4" />
      <path d="M12 4c0 2.21-1.79 4-4 4S4 6.21 4 4" />
      <path d="M18 12.5a5.5 5.5 0 0 1-5.5 5.5h-1a5.5 5.5 0 0 1-5.5-5.5V12c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v.5Z" />
    </svg>
    <span className="font-headline text-2xl font-bold text-foreground tracking-tighter">
      Hard Hat AI
    </span>
  </div>
);


export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={cn(
      "sticky top-0 inset-x-0 z-50 transition-all duration-300",
      { "bg-background/80 backdrop-blur-sm border-b border-white/10": scrolled }
    )}>
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/">
          <HardHatLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
           <CtaButton asChild className="hidden sm:inline-flex" style={{paddingTop: '10px', paddingBottom: '10px'}}>
              <Link href="#cta">Get my documents</Link>
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
