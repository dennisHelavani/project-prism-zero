
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
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: "Our story", href: "/#our-story" },
  { name: "Pricing", href: "/#pricing" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Reviews", href: "/#reviews" },
  { name: "Contact", href: "/contact" },
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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
      
      if (pathname !== '/') {
          setActiveSection(null);
          return;
      }
      
      const sections = navLinks
        .map(link => (link.href.startsWith('/#') ? document.getElementById(link.href.substring(2)) : null))
        .filter((s): s is HTMLElement => s !== null);

      let currentSectionId: string | null = null;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
            break;
        }
      }
      
      setActiveSection(currentSectionId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <header className={cn(
      "sticky top-0 inset-x-0 z-50 transition-all duration-300",
      { "bg-background/80 backdrop-blur-sm border-b border-white/10": scrolled }
    )}>
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <div className="flex-1 flex justify-start">
            <Link href="/">
              <HardHatLogo />
            </Link>
        </div>
        
        <nav className="hidden items-center justify-center gap-8 md:flex flex-1">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="nav-link whitespace-nowrap" data-active={activeSection === link.href.substring(2) || pathname === link.href}>
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
           <CtaButton asChild>
             <a href="/#upload">Generate my documents</a>
           </CtaButton>
        </div>

        <div className="md:hidden flex-1 flex justify-end">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-0 border-l">
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
                            <a href="/#upload" onClick={() => setMobileMenuOpen(false)}>Generate my documents</a>
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
