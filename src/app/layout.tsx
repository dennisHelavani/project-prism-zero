import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/cookie-consent";
import { SEO } from "@/config/seo.config";

export const metadata: Metadata = {
  metadataBase: new URL(SEO.domain),

  title: { default: SEO.defaultTitle, template: SEO.titleTemplate },
  description: SEO.description,
  keywords: [...SEO.keywords],

  alternates: { canonical: "/" },

  openGraph: {
    type: SEO.openGraph.type,
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description: SEO.description,
    url: "/",                                // resolves via metadataBase
    images: [{ url: SEO.brand.ogDefault, width: 1200, height: 630 }],
    locale: SEO.openGraph.locale,
  },

  twitter: {
    card: SEO.twitter.card as "summary_large_image",
    site: SEO.twitter.handle,
    creator: SEO.twitter.handle,
    title: SEO.defaultTitle,
    description: SEO.description,
    images: [SEO.brand.ogDefault],
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* <link rel="preconnect" href="https://js.stripe.com" crossOrigin="" /> */}
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
        <CookieConsent />

        {/* Organization JSON-LD (site-wide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SEO.siteName,
              url: SEO.domain,
              logo: `${SEO.domain}${SEO.brand.logo}`,
              sameAs: SEO.organization.sameAs,
            }),
          }}
        />
      </body>
    </html>
  );
}
