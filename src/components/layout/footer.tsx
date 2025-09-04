import Link from "next/link";

const columns = [
  { title: "Company", links: [{name: "Our story", href: "/our-story"}, {name: "Contact Us", href: "/contact"}, {name: "Reviews", href:"/reviews"}] },
  { title: "Resources", links: [{name: "Blog", href: "/blog"}, {name: "How It Works", href: "/how-it-works"}, {name: "Pricing", href: "/pricing"}] },
  { title: "Legal", links: [{name: "Privacy", href: "/legal/privacy"}, {name: "Terms", href: "/legal/terms"}, {name: "Cookies", href: "/legal/cookies"}] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-headline text-xl font-bold text-foreground">
              Hard Hat AI
            </Link>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Hard Hat AI. All rights reserved.</p>
          <p className="mt-2">AI-generated — review before use.</p>
        </div>
      </div>
    </footer>
  );
}
