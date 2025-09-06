
import { Check } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { CtaButton } from "../ui/cta-button";
import Link from "next/link";
import { StarBorder } from "../ui/star-border";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    features: ["5 Templates", "10 Users", "Basic Integrations", "Email Support"],
    cta: "Try with your template",
    ctaVariant: "cta",
  },
  {
    name: "Growth",
    price: "$99",
    features: ["50 Templates", "50 Users", "Advanced Integrations", "Priority Support"],
    cta: "Book a 15-min demo",
    ctaVariant: "star",
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="py-16 md:py-24">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text">Pricing Plans</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a plan that scales with your projects and team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 md:mt-16 max-w-3xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className="flex flex-col bg-card border-white/10 shadow-e1 rounded-xl">
            <CardHeader className="p-6">
              <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
              <CardDescription className="text-4xl font-bold text-primary glowing-text">{tier.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6">
              <ul className="space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6 mt-4">
              {tier.ctaVariant === "cta" ? (
                <CtaButton asChild className="w-full">
                  <Link href="#cta">{tier.cta}</Link>
                </CtaButton>
              ) : (
                <StarBorder as={Link} href="#" className="w-full">
                  {tier.cta}
                </StarBorder>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
