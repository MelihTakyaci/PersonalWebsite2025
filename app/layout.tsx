// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { buildGraph } from "@/lib/structured-data";
import "./globals.css";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
  display: "swap",
  preload: true
});
const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: "swap",
  preload: true
});

const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Melih Takyaci Portfolio",
  title: {
    default: "Melih Takyaci | Computer Science Researcher & Full-Stack Developer",
    template: "%s | Melih Takyaci"
  },
  description:
    "Melih Takyaci (ORCID 0009-0008-5987-5924) is a computer science researcher at Dokuz Eylul University working on health informatics, process mining and applied machine learning, with peer-reviewed publications in bibliometric analysis and AI in healthcare. Also a full-stack developer working in Next.js, TypeScript and PostgreSQL.",
  // Both spellings of the name, then the terms the published record actually
  // supports. The previous list led with a wall of stack names no artefact on
  // this site or elsewhere corroborates, which is noise a verifier discounts.
  keywords: [
    "Melih Takyaci","Melih Takyacı","Melih Takyaci researcher","Melih Takyaci ORCID",
    "Melih Takyaci publications","Melih Takyaci Dokuz Eylul",
    "health informatics research","process mining","bibliometric analysis",
    "scientific mapping","institutional data analytics","AI in healthcare",
    "explainable artificial intelligence","medical image analysis",
    "Dokuz Eylul University computer science",
    "full-stack developer","Next.js","TypeScript","PostgreSQL","Python","PyTorch"
  ],
  creator: "Melih Takyaci",
  authors: [{ name: "Melih Takyaci", url: siteUrl }],
  alternates: {
    // No Turkish route exists, so the previous hreflang pointed at a 404 and
    // told crawlers a translation was available when none is.
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Melih Takyaci Portfolio",
    title: "Melih Takyaci | Full-Stack Developer & Embedded Systems Engineer",
    description:
      "Full-Stack Developer specializing in Next.js, Nest.js, and Embedded Systems. Expert in Computer Vision, AI integration, and modern web architecture.",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Melih Takyaci - Full-Stack & Embedded Systems Developer" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melih Takyaci | Full-Stack Developer & Embedded Systems Engineer",
    description: "Full-Stack Developer specializing in Next.js, Nest.js, and Embedded Systems — portfolio & projects.",
    creator: "@melihtakyaci",
    images: [ogImage],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  // AI görünürlüğü için güçlü robots sinyalleri:
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Ek özel meta sinyalleri
  other: {
    "ai-friendly": "true",
    "ai-content-license": "CC-BY-4.0", // içeriğin alıntılanmasına izin veriyorsan
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Önemli: DNS/performans iyileştirme */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        {/* One schema.org graph: the works reference the person by @id, so a
            consumer reads "these papers were written by this ORCID" rather
            than finding a person and some articles that share a page. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGraph(siteUrl)) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-ink-0 text-fg-2 antialiased`}>
        {/* A keyword summary used to live here, hidden with sr-only *and*
            aria-hidden — invisible to readers and to assistive tech alike, so
            it existed only to be crawled, alongside a second <h1> competing
            with the real one. That is the shape search engines treat as hidden
            text. The same facts now reach machines through the JSON-LD graph
            and llms.txt, and readers through the publications list. */}
        {children}
      </body>
    </html>
  );
}