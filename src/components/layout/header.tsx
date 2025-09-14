'use client';

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
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
  { name: "Our story", href: "#our-story" },
  { name: "Pricing", href: "#pricing" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Reviews", href: "#reviews" },
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getHeaderHeight = useCallback(() => {
    if (typeof window === "undefined") return 80;
    const header = document.getElementById("site-header");
    return header ? header.offsetHeight : 80;
  }, []);

  const smoothScrollToId = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = getHeaderHeight();
      const y = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.scrollTo({
        top: y,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
      
      // Set a flag to prevent observer from firing during scroll
      isClickingRef.current = true;
      setActiveSection(id);
      
      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Reset the flag after scrolling is likely complete
      clickTimeoutRef.current = setTimeout(() => {
        isClickingRef.current = false;
      }, 1000);
    }
  }, [getHeaderHeight]);

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/' && href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1); 
      history.pushState(null, '', href);
      smoothScrollToId(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
        setActiveSection(null);
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        return;
    }

    const headerHeight = getHeaderHeight();
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingRef.current) return;
        
        let bestEntry: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        });
        if (bestEntry) {
          setActiveSection(bestEntry.target.id);
        }
      },
      {
        rootMargin: `-${headerHeight}px 0px -55% 0px`,
        threshold: 0.1,
      }
    );
    observerRef.current = observer;

    const sections = navLinks
      .map(link => (link.href.startsWith('#') ? document.getElementById(link.href.substring(1)) : null))
      .filter((s): s is HTMLElement => s !== null);

    sections.forEach(section => observer.observe(section));

    // Handle initial load with hash
    const initialHash = window.location.hash;
    if (initialHash) {
      const id = initialHash.substring(1);
      // Use timeout to ensure page is fully rendered
      setTimeout(() => {
        smoothScrollToId(id);
      }, 100);
    }

    return () => {
      observer.disconnect();
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [pathname, getHeaderHeight, smoothScrollToId]);

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
            const id = link.href.startsWith('#') ? link.href.substring(1) : null;
            const finalHref = pathname === '/' ? link.href : `/${link.href}`;

            if (link.name === "Contact") {
              return (
                 <Link
                  key={link.name}
                  href={link.href}
                  className="nav-link whitespace-nowrap"
                  data-active={pathname === link.href}
                >
                  {link.name}
                </Link>
              );
            }
            return (
              <Link
                key={link.name}
                href={finalHref}
                className="nav-link whitespace-nowrap"
                data-active={activeSection === id}
                onClick={(e) => handleNavClick(link.href, e as any)}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
           <CtaButton asChild>
             <Link href={pathname === '/' ? '#upload' : '/#upload'} onClick={(e) => handleNavClick("#upload", e as any)}>Generate my documents</Link>
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
                          const finalHref = pathname === '/' ? link.href : `/${link.href}`;
                          if (link.name === 'Contact') {
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            )
                          }
                          return (
                            <Link
                                key={link.name} 
                                href={finalHref}
                                className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    if (pathname === '/' && link.href.startsWith("#")) {
                                        e.preventDefault();
                                        const id = link.href.substring(1);
                                        history.pushState(null, '', link.href);
                                        smoothScrollToId(id);
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
                            <Link href={pathname === '/' ? '#upload' : '/#upload'} onClick={(e) => {
                                setMobileMenuOpen(false);
                                if (pathname === '/') {
                                  e.preventDefault();
                                  history.pushState(null, '', '#upload');
                                  smoothScrollToId("upload");
                                }
                            }}>Generate my documents</Link>
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
