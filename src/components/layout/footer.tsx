import Link from "next/link";

const footerNav = [
  { name: "Product", items: ["Features", "Integrations", "Pricing", "Changelog"] },
  { name: "Company", items: ["About", "Blog", "Careers", "Contact"] },
  { name: "Resources", items: ["Community", "Help Center", "API Docs"] },
  { name: "Legal", items: ["Privacy", "Terms of Service"] },
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


export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
                 <Link href="/">
                    <HardHatLogo />
                </Link>
                <p className="text-muted-foreground mt-4 text-sm">AI-powered compliance documents.</p>
            </div>
            {footerNav.map(section => (
                <div key={section.name}>
                    <h3 className="font-semibold text-foreground">{section.name}</h3>
                    <ul className="mt-4 space-y-2">
                        {section.items.map(item => (
                            <li key={item}>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-8 text-center text-sm text-muted-foreground border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} Hard Hat AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
