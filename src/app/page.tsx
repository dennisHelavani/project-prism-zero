
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ProofSection } from "@/components/landing/proof-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { RoiSection } from "@/components/landing/roi-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CaseStudySection } from "@/components/landing/case-study-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FormSection } from "@/components/landing/form-section";
import { Vortex } from "@/components/ui/vortex";
import { SolutionsSection } from "@/components/landing/solutions-section";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Vortex
          backgroundColor="transparent"
          particleCount={200}
          baseHue={240}
          rangeY={200}
          baseSpeed={0.05}
          rangeSpeed={0.5}
          baseRadius={0.5}
          rangeRadius={1.5}
          className="fixed inset-0 -z-10"
        />
      <Header />
      <main>
        <HeroSection />
        <ProofSection />
        <UseCasesSection />
        <SolutionsSection />
        <RoiSection />
        <BenefitsSection />
        {/* <IntegrationsSection /> */}
        <CaseStudySection />
        <PricingSection />
        <ReviewsSection />
        <FormSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
