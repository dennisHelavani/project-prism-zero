import Link from "next/link";
import { CtaButton } from "@/components/ui/cta-button";

const navLinks = [
  { name: "Our story", href: "/our-story" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact Us", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="font-headline text-xl font-bold text-foreground">
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
          <CtaButton asChild className="hidden px-5 py-2.5 text-sm sm:inline-flex">
            <Link href="#cta">Get my documents</Link>
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
