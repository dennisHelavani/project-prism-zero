import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustSection } from "@/components/landing/trust-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { CtaSection } from "@/components/landing/cta-section";
import { PillarsSection } from "@/components/landing/pillars-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <PillarsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ReviewsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
