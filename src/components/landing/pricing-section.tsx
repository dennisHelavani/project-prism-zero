import { Check, Crown, Rocket, Zap } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import BlurText from "../ui/blur-text";
import { MotionDiv } from "../ui/motion-div";
import { cn } from "@/lib/utils";
import { CtaButton } from "../ui/cta-button";
import { StarBorder } from "../ui/star-border";

const tiers = [
  {
    name: "Basic",
    price: "$299",
    priceSuffix: "/project",
    description: "Perfect for small businesses starting with AI automation.",
    features: [
      "5 pages included",
      "Basic SEO optimization",
      "Mobile responsive design",
      "2 revisions",
      "Standard support",
    ],
    cta: "Get Started",
    href: "#",
    icon: <Rocket className="w-6 h-6 text-primary" />,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$799",
    priceSuffix: "/project",
    description: "Ideal for growing companies needing robust e-commerce features.",
    features: [
      "Up to 15 pages included",
      "Advanced SEO optimization",
      "E-commerce integration",
      "Unlimited revisions",
      "Priority support",
      "Content creation assistance",
    ],
    cta: "Get Started",
    href: "#",
    icon: <Zap className="w-6 h-6 text-primary" />,
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="py-16 md:py-24 scroll-m-24">
      <MotionDiv>
        <div className="text-center">
          <BlurText
            as="h2"
            className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
            text="Pricing"
          />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan that fits your project needs and budget.
          </p>
        </div>
      </MotionDiv>

      <MotionDiv delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 md:mt-16 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className={cn(
                "flex flex-col bg-card border-white/10 shadow-e1 rounded-xl p-6 transition-transform duration-300 ease-in-out hover:scale-105",
                {"border-[#FABE2C]": tier.highlighted}
            )}>
              <CardHeader className="p-0">
                <div className="flex items-center gap-2">
                  {tier.icon}
                  <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1 pt-4">
                    <p className="text-4xl font-bold tracking-tight">{tier.price}</p>
                    <span className="text-sm text-muted-foreground">{tier.priceSuffix}</span>
                </div>
                 <CardDescription className="pt-2 text-left">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-0 pt-6">
                <CtaButton asChild className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </CtaButton>
                <div className="mt-6 space-y-3">
                    <p className="font-semibold">What's included:</p>
                    <ul className="space-y-2">
                        {tier.features.map(feature => (
                             <li key={feature} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MotionDiv>
    </SectionWrapper>
  );
}
