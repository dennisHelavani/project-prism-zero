
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CtaButton } from "../ui/cta-button";

const navLinks = [
  { name: "Our story", href: "#our-story" },
  { name: "Pricing", href: "#pricing" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact", href: "#contact" },
];

const HardHatLogo = () => (
    <div className="text-2xl font-bold text-foreground">
        <span style={{color: '#FABE2C'}}>H</span>ard<span style={{color: '#FABE2C'}}>H</span>at<span style={{color: '#FABE2C'}}>A</span>i
    </div>
);


export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
      
      const sections = navLinks.map(link => document.querySelector(link.href));
      let currentSection: string | null = null;
      sections.forEach((section) => {
        if (section) {
          const sectionTop = section.getBoundingClientRect().top;
          if (sectionTop < window.innerHeight / 2) {
            currentSection = section.id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

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
            <Link key={link.name} href={link.href} className="nav-link" data-active={activeSection === link.href.substring(1)}>
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
           <CtaButton asChild>
             <Link href="#upload">Generate my documents</Link>
           </CtaButton>
        </div>
        <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
                 <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                         <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                            <HardHatLogo />
                        </Link>
                         <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </div>
                    <nav className="flex flex-col gap-4 p-4">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                            {link.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto p-4 border-t">
                        <CtaButton asChild>
                            <Link href="#upload" onClick={() => setMobileMenuOpen(false)}>Generate my documents</Link>
                        </CtaButton>
                    </div>
                 </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
