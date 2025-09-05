'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StarBorder } from "../ui/star-border";

const navLinks = [
  { name: "Our story", href: "#our-story" },
  { name: "Pricing", href: "#" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact Us", href: "#" },
];

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
        <Link href="/" className="font-headline text-2xl font-bold text-foreground tracking-tighter">
          Hard Hat AI
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
           <StarBorder as={Link} href="#cta" className="hidden sm:inline-flex">
              Get my documents
          </StarBorder>
        </div>
      </div>
    </header>
  );
}
