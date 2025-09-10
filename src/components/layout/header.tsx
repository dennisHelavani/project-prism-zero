
'use client';

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
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
import Image from "next/image";
import { HardHat } from "lucide-react";

const navLinks = [
  { name: "Our story", href: "/#our-story" },
  { name: "Pricing", href: "/#pricing" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Reviews", href: "/#reviews" },
  { name: "Contact", href: "/contact" },
];

const HardHatLogo = () => (
    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <HardHat className="h-6 w-6 text-[#FABE2C]" />
        <div>
          <span style={{color: '#FABE2C'}}>H</span>ardHatAi
        </div>
    </div>
);


export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  const smoothScrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const header = document.getElementById("site-header");
    const offset = header ? header.offsetHeight + 24 : 96;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2); 
      smoothScrollToId(id);
      history.replaceState(null, "", href);
    }
  };


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
        const sectionTop = section.offsetTop - 150;
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
    <header id="site-header" className={cn(
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
          {navLinks.map((link) => {
            if (link.name === "Contact") {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link whitespace-nowrap"
                >
                  {link.name}
                </a>
              );
            }
            return (
              <Link
                key={link.name}
                href={pathname === '/' ? link.href : `/${link.href}`}
                className="nav-link whitespace-nowrap"
                data-active={activeSection === link.href.substring(2) || pathname === link.href}
                onClick={(e) => handleNavClick(link.href, e)}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
           <CtaButton asChild>
             <a href="/#upload" onClick={(e) => handleNavClick("/#upload", e as any)}>Generate my documents</a>
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
                        {navLinks.map((link) => {
                          if (link.name === 'Contact') {
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            )
                          }
                          return (
                            <Link
                                key={link.name} 
                                href={pathname === '/' ? link.href : `/${link.href}`}
                                className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                onClick={(e) => {
                                    if (pathname === '/' && link.href.startsWith("/#")) {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                    setTimeout(() => {
                                        const id = link.href.slice(2);
                                        smoothScrollToId(id);
                                        history.replaceState(null, "", link.href);
                                    }, 150);
                                    } else {
                                      setMobileMenuOpen(false);
                                    }
                                }}
                            >
                            {link.name}
                            </Link>
                          )
                        })}
                    </nav>
                    <div className="mt-auto p-4 border-t">
                        <CtaButton asChild>
                            <a href="/#upload" onClick={(e) => {
                                e.preventDefault();
                                setMobileMenuOpen(false);
                                setTimeout(() => {
                                    smoothScrollToId("upload");
                                    history.replaceState(null, "", "/#upload");
                                }, 150);
                            }}>Generate my documents</a>
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
