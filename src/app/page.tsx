
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
import { SolutionsSection } from "@/components/landing/solutions-section";
import { JsonLd } from "@/components/seo/JsonLd";
import { SEO } from "@/config/seo.config";
import Marketing from '@/config/marketing.tokens.json';


const org = {
  "@context":"https://schema.org",
  "@type":"Organization",
  "name":"Hard Hat AI",
  "url": SEO.domain,
  "logo": `${SEO.domain}/images/brand/logo.png`,
  "sameAs":[]
};
const product = {
  "@context":"https://schema.org",
  "@type":"SoftwareApplication",
  "name":"Hard Hat AI — RAMS & CDM document generator",
  "applicationCategory":"BusinessApplication",
  "operatingSystem":"Web",
  "offers": { "@type":"Offer", "price":"9.50", "priceCurrency":"GBP" },
  "description":"Generate HSE/CDM documents in minutes with branded, compliant drafts."
};
const website = {
  "@context":"https://schema.org",
  "@type":"WebSite",
  "url": SEO.domain,
  "name":"Hard Hat AI",
  "potentialAction": {
    "@type":"SearchAction",
    "target":`${SEO.domain}/search?q={query}`,
    "query-input":"required name=query"
  }
};

const faq = {
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "mainEntity":[
    {
      "@type":"Question",
      "name":"Can I use my own custom templates?",
      "acceptedAnswer":{"@type":"Answer","text":"In MVP we use a standardized branded template. Uploading your own templates is planned for Phase 2."}
    },
    {
      "@type":"Question",
      "name":"Where is our data stored?",
      "acceptedAnswer":{"@type":"Answer","text":"Form submissions are processed via Make.com and the output is emailed. Minimal run metadata is retained for troubleshooting and quality."}
    }
  ]
};

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <JsonLd data={org} />
      <JsonLd data={product} />
      <JsonLd data={website} />
      <JsonLd data={faq} />
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
       {/*  <FormSection />*/}
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
