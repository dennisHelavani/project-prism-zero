
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CookieConsent } from '@/components/cookie-consent';
import { SEO } from '@/config/seo.config';

export const metadata: Metadata = {
  metadataBase: new URL(SEO.domain),
  title: { default: SEO.defaultTitle, template: SEO.titleTemplate },
  description: SEO.description,
  keywords: SEO.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description: SEO.description,
    url: "/",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
    locale: "en_GB"
  },
  twitter: {
    card: "summary_large_image",
    site: SEO.twitter.handle,
    creator: SEO.twitter.handle,
    title: SEO.defaultTitle,
    description: SEO.description,
    images: ["/og/default.png"]
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
