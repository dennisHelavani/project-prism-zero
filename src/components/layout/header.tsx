import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "How it Works", href: "#how-it-works" },
  { name: "Use Cases", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "Company", href: "#" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
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
           <Button asChild variant="outline" className="hidden rounded-lg px-5 py-2.5 text-sm font-semibold sm:inline-flex">
            <Link href="#">Sign in</Link>
          </Button>
           <Button asChild className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex">
            <Link href="#">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
