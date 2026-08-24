// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://melihtakyaci.com"; // <- gerçek alan adın
const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Melih Takyacı Portfolio",
  title: "Melih Takyacı | Full-Stack & Embedded Systems Developer",
  description:
    "Portfolio of Melih Takyacı — Next.js, Fastify, PostgreSQL, Embedded (ESP32/STM32), Computer Vision (YOLOv11n, OpenCV), and AI projects.",
  keywords: [
    "Melih Takyacı","Full Stack","Next.js","TypeScript","Fastify","PostgreSQL",
    "ESP32","STM32","OpenCV","YOLOv11n","AI","RAG","Monorepo"
  ],
  creator: "Melih Takyacı",
  authors: [{ name: "Melih Takyacı", url: siteUrl }],
  alternates: {
    canonical: siteUrl,
    languages: { "en-US": siteUrl, "tr-TR": `${siteUrl}/tr` }, // çok dilli planlıyorsan
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Melih Takyacı",
    title: "Melih Takyacı | Full-Stack & Embedded Systems Developer",
    description:
      "Exploring modern web, embedded systems, and AI. Selected projects, write-ups, and experiments.",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Melih Takyacı" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melih Takyacı",
    description: "Full-Stack & Embedded Systems Developer — portfolio & projects.",
    creator: "@melihtakyaci", // varsa güncelle
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
    // Google & AI Overviews uyumlu
    googleBot: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
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
        {/* JSON-LD: Person + WebSite (AI’ların entity çözümlemesi için) */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Melih Takyacı",
              "url": siteUrl,
              "image": `${siteUrl}/profile.jpg`,
              "jobTitle": "Full-Stack Developer & AI/Embedded Enthusiast",
              "worksFor": { "@type": "Organization", "name": "Acem Solutions" },
              "sameAs": [
                "https://github.com/MelihTakyaci",
                "https://www.linkedin.com/in/melihtakyaci/",
                "https://x.com/melihtakyaci"
              ],
              "knowsAbout": [
                "Artificial Intelligence","RAG","Next.js","TypeScript","Fastify",
                "PostgreSQL","Embedded Systems","ESP32","Computer Vision","OpenCV","YOLOv11n"
              ],
              "description": "Software & hardware projects: modern web, embedded systems, and AI."
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": siteUrl,
              "name": "Melih Takyacı",
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/search?q={query}`,
                "query-input": "required name=query"
              }
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}