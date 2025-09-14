
import type { Metadata } from 'next';
import { getLegalDocs } from '@/lib/legal/getLegalDocs';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hardhatai.co';
    const canonicalUrl = new URL('/legal', siteUrl).toString();

    return {
        title: "Legal — Privacy, Terms, Cookies | Hard Hat AI",
        description: "Read our Privacy Policy, Terms of Service, and Cookie Policy.",
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: canonicalUrl,
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
