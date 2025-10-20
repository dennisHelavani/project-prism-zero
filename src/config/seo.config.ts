// seo.config.ts
export const SEO = {
  siteName: "Hard Hat AI",
  domain: "https://hardhatai.co",                // absolute
  defaultTitle: "Generate HSE & CDM documents in minutes — Hard Hat AI",
  titleTemplate: "%s | Hard Hat AI",
  description:
    "AI-powered editable documents, fully compliant and ready to send. Spend less time on paperwork and more on what matters—building.",
  keywords: [
    "automated construction phase plan generator",
    "create construction phase plan form online",
    "construction phase plan tool for contractors",
    "instant RACM form generation for construction",
    "risk and control matrix template for construction",
    "online RACM & CPP forms",
    "construction documentation generator – CPP & RACM",
    "digital construction safety document tool CPP",
    "health and safety documents",
    "construction compliance document generator – forms",
  ],
  twitter: { handle: "@HardHatAI", card: "summary_large_image" },
  openGraph: { type: "website", locale: "en_GB" },
  brand: {
    logo: "/images/brand/logo.png",              // make sure this path exists
    ogDefault: "/og/default.png"                 // add a default OG image
  },
  organization: {
    sameAs: [
      // Add the socials you actually have (optional but nice for Knowledge Panels)
      // "https://twitter.com/HardHatAI",
      // "https://www.linkedin.com/company/hardhatai/",
    ],
  },
} as const;
