import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionWrapper } from "./section-wrapper";
import { ShieldCheck, CreditCard, KeyRound } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "CDM-aware",
    description: "Works with UK construction standards in mind, providing compliant templates and sensible defaults.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: "Secure checkout",
    description: "Integrated with Stripe for secure payments and a simple customer portal for managing your plan.",
  },
  {
    icon: <KeyRound className="h-8 w-8 text-primary" />,
    title: "Passwordless access",
    description: "Magic links for easy and secure sign-in without the hassle of remembering passwords (coming soon).",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col items-center justify-center p-8 text-center bg-card border-white/10 shadow-e1 rounded-lg">
            <div className="mb-4">{feature.icon}</div>
            <CardHeader className="p-0">
              <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardDescription className="mt-2 text-muted-foreground">
              {feature.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
