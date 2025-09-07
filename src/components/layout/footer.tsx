
import Link from "next/link";
import { CtaButton } from "../ui/cta-button";

const footerNav = [
  { name: "Product", items: [{name: "Templates", href: "#templates"}, {name: "Integrations", href: "#integrations"}, {name: "Pricing", href: "#pricing"}, {name: "Reviews", href: "#reviews"}] },
  { name: "Company", items: [{name: "Our Story", href: "#our-story"}, {name: "Contact", href: "#contact"}] },
  { name: "Resources", items: [{name: "FAQ", href:"#faq"}] },
  { name: "Legal", items: [{name: "Privacy", href:"#"}, {name: "Terms of Service", href:"#"}] },
];

const HardHatLogo = () => (
    <div className="text-2xl font-bold text-foreground">
        <span style={{color: '#FABE2C'}}>H</span>ard<span style={{color: '#FABE2C'}}>H</span>at<span style={{color: '#FABE2C'}}>A</span>i
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
                                <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
         <div className="mt-16 text-center">
            <CtaButton asChild>
                <a href="#upload">Try with your template</a>
            </CtaButton>
         </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-8 text-center text-sm text-muted-foreground border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} Hard Hat AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
