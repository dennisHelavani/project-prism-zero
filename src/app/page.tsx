
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

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProofSection />
        <UseCasesSection />
        <HowItWorksSection />
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
