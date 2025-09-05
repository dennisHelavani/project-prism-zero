import Link from "next/link";

const footerNav = [
  { name: "Product", items: ["Features", "Integrations", "Pricing", "Changelog"] },
  { name: "Company", items: ["About", "Blog", "Careers", "Contact"] },
  { name: "Resources", items: ["Community", "Help Center", "API Docs"] },
  { name: "Legal", items: ["Privacy", "Terms of Service"] },
];


export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
                 <Link href="/" className="font-headline text-2xl font-bold text-foreground tracking-tighter">
                    Hard Hat AI
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
