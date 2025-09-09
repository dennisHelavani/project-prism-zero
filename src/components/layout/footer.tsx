
import Link from "next/link";
import { CtaButton } from "../ui/cta-button";

const footerNav = [
  { name: "Product", items: [{name: "Templates", href: "/#templates"}, {name: "Integrations", href: "/#integrations"}, {name: "Pricing", href: "/#pricing"}, {name: "Reviews", href: "/#reviews"}] },
  { name: "Company", items: [{name: "Our Story", href: "/#our-story"}, {name: "Contact", href: "/contact"}] },
  { name: "Resources", items: [{name: "FAQ", href:"/#faq"}] },
  { name: "Legal", items: [{name: "Privacy", href:"#"}, {name: "Terms of Service", href:"#"}] },
];

const HardHatLogo = () => (
    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#FABE2C]"
        >
            <path d="M2 13a4 4 0 0 0 4-4h12a4 4 0 0 0 4 4v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
            <path d="M12 4V9" />
            <path d="M7.5 4.5 9 9" />
            <path d="m16.5 4.5-1.5 4.5" />
        </svg>
        <div>
          <span style={{color: '#FABE2C'}}>H</span>ardHatAi
        </div>
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
                            <li key={item.name}>
                                <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {item.name}
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
