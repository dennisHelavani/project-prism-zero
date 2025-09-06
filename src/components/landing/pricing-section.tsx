
import { Check, Clock } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { CtaButton } from "../ui/cta-button";
import Link from "next/link";
import { StarBorder } from "../ui/star-border";
import BlurText from "../ui/blur-text";
import { Badge } from "../ui/badge";

const tiers = [
  {
    name: "Per-document (RAMS/CPP)",
    description: "Contact us for pricing (email invoice; Stripe coming soon).",
    cta: "Try with your template",
    href: "#upload",
    ctaVariant: "cta",
    comingSoon: false,
  },
  {
    name: "Pro subscription",
    description: "Coming soon — includes template library and integrations.",
    cta: "Book a 15-min demo",
    href: "#book-demo",
    ctaVariant: "star",
    comingSoon: true,
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="py-16 md:py-24">
      <div className="text-center">
        <BlurText
          as="h2"
          className="font-headline text-3xl md:text-4xl font-bold text-foreground glowing-text justify-center"
          text="Pricing"
        />
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          During the MVP, generation is available by request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 md:mt-16 max-w-3xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className="flex flex-col bg-card border-white/10 shadow-e1 rounded-xl">
            <CardHeader className="p-6">
              <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <p className="text-muted-foreground">{tier.description}</p>
            </CardContent>
            <CardFooter className="p-6 mt-auto">
              {tier.ctaVariant === "cta" ? (
                <CtaButton asChild className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </CtaButton>
              ) : (
                <StarBorder as={Link} href={tier.href} className="w-full">
                  {tier.comingSoon && <Clock className="mr-2" />}
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
