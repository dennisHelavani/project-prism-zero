
import type { Metadata } from 'next';
import { getLegalDocs } from '@/lib/legal/getLegalDocs';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SEO } from '@/config/seo.config';

export async function generateMetadata(): Promise<Metadata> {
    const title = "Legal — Privacy, Terms, Cookies";
    const description = "Read our Privacy Policy, Terms of Service, and Cookie Policy.";
    const url = "/legal";

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            images: [{ url: "/og/legal.png", width: 1200, height: 630 }]
        },
        twitter: {
            title,
            description,
            images: ["/og/legal.png"]
        }
    }
}

export default async function LegalPage() {
  const docs = await getLegalDocs();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <LegalLayout docs={docs} />
      </main>
      <Footer />
    </div>
  );
}
