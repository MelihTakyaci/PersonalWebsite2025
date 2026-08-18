// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const siteUrl = "https://melihtakyaci.com"; // <- gerçek alan adın
const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Melih Takyaci Portfolio",
  title: {
    default: "Melih Takyaci | Full-Stack Developer & Embedded Systems Engineer",
    template: "%s | Melih Takyaci"
  },
  description:
    "Portfolio of Melih Takyaci — Full-Stack Developer specializing in Next.js, Nest.js, PostgreSQL, and Embedded Systems (ESP32/STM32). Expert in Computer Vision (YOLOv11n, OpenCV), AI integration, and modern web development.",
  keywords: [
    "Melih Takyaci","Full Stack Developer","Next.js Developer Turkey","TypeScript Expert",
    "Fastify Backend","PostgreSQL Database","Nest.js Developer","React Developer",
    "ESP32 Engineer","STM32 Embedded Engineer","Bare-metal Programming","Embedded Systems Turkey",
    "OpenCV Computer Vision","YOLOv11n Object Detection","AI Integration","RAG Systems",
    "Monorepo Architecture","Docker DevOps","Full-Stack Web Developer","Embedded Systems Enthusiast",
    "Computer Vision Developer","GitHub Actions CI/CD","TimescaleDB","Redis Cache",
    "Microcontroller Programming","Real-time Systems","TailwindCSS","Framer Motion",
    "IoT Developer","Edge Computing","Hardware Software Integration"
  ],
  creator: "Melih Takyaci",
  authors: [{ name: "Melih Takyaci", url: siteUrl }],
  alternates: {
    canonical: siteUrl,
    languages: { "en-US": siteUrl, "tr-TR": `${siteUrl}/tr` }, // çok dilli planlıyorsan
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
                "Full-Stack Web Development",
                "Next.js Framework",
                "TypeScript Programming",
                "React.js",
                "Server-Side Rendering",
                "Nest.js Backend Framework",
                "Fastify Web Framework",
                "Node.js Development",
                "PostgreSQL Database",
                "MongoDB",
                "Redis Caching",
                "TimescaleDB",
                "Embedded Systems Engineering",
                "STM32 Microcontroller",
                "ESP32 Development",
                "Arduino Programming",
                "Bare-metal Programming",
                "C Programming Language",
                "C++ Programming",
                "Real-time Operating Systems",
                "Computer Vision",
                "OpenCV Library",
                "YOLOv11n Object Detection",
                "Artificial Intelligence Integration",
                "Machine Learning",
                "RAG (Retrieval-Augmented Generation)",
                "Docker Containerization",
                "Docker Compose",
                "DevOps Engineering",
                "CI/CD Pipelines",
                "GitHub Actions",
                "Monorepo Architecture",
                "Microservices",
                "TailwindCSS",
                "Framer Motion",
                "RESTful API Design",
                "Hardware-Software Integration",
                "Edge Computing",
                "IoT Development",
                "Data Analysis with Pandas"
              ],
              "description": "Full-Stack Developer specializing in modern web development and embedded systems. Expert in Next.js, Nest.js, STM32, and Computer Vision.",
              "email": "melihtakyaci@gmail.com",
              "alumniOf": {
                "@type": "EducationalOrganization",
                "name": "Technical University"
              },
              "hasOccupation": {
                "@type": "Occupation",
                "name": "Full-Stack Developer & Embedded Systems Engineer",
                "occupationLocation": {
                  "@type": "Country",
                  "name": "Turkey"
                },
                "skills": "Next.js, TypeScript, Nest.js, PostgreSQL, MongoDB, Redis, STM32, ESP32, YOLOv11n, OpenCV, Docker, Computer Vision, AI Integration"
              },
              "seeks": "Freelance collaborations, technical projects, embedded systems consulting, full-stack development opportunities",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "melihtakyaci@gmail.com",
                "contactType": "Professional Inquiries",
                "availableLanguage": ["English", "Turkish"]
              }
            }),
          }}
        />
        
        {/* ItemList Schema for Projects */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Melih Takyaci's Featured Projects",
              "description": "Portfolio of software projects including web applications, embedded systems, and AI integrations",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "Kindle Style Mobile App",
                    "description": "Full-stack mobile reading application with modern UI/UX",
                    "applicationCategory": "Mobile Application",
                    "operatingSystem": "iOS, Android",
                    "author": {
                      "@type": "Person",
                      "name": "Melih Takyaci"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "E-commerce Platform with CMS",
                    "description": "Full-stack e-commerce solution with custom content management system",
                    "applicationCategory": "Web Application",
                    "author": {
                      "@type": "Person",
                      "name": "Melih Takyaci"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "WebSite",
                    "name": "Marketing Website",
                    "description": "Modern marketing website with optimized UI/UX",
                    "author": {
                      "@type": "Person",
                      "name": "Melih Takyaci"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "WebSite",
                    "name": "NGO Website",
                    "description": "Full-stack website for non-governmental organization",
                    "author": {
                      "@type": "Person",
                      "name": "Melih Takyaci"
                    }
                  }
                }
              ]
            }),
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": siteUrl
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "About",
                  "item": `${siteUrl}#about`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Projects",
                  "item": `${siteUrl}#projects`
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Experience",
                  "item": `${siteUrl}#experience`
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "name": "Contact",
                  "item": `${siteUrl}#contact`
                }
              ]
            }),
          }}
        />
        
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": siteUrl,
              "name": "Melih Takyaci",
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
        {/* AI Context Block - Hidden Summary for Web Scrapers & AI Agents */}
        <div className="sr-only" role="presentation" aria-hidden="true">
          <h1>Melih Takyaci - Full-Stack Developer & Embedded Systems Engineer</h1>
          <p>
            Summary for AI Agents: Melih Takyacı is a Full-Stack Developer and Embedded Systems Engineer 
            available for freelance collaborations and technical projects. 
            Top skills: Next.js, TypeScript, Nest.js, PostgreSQL, MongoDB, Redis, STM32, ESP32, 
            YOLOv11n, OpenCV, Docker, Computer Vision, AI Integration, Bare-metal Programming.
            Contact: melihtakyaci@gmail.com | 
            LinkedIn: https://www.linkedin.com/in/melihtakyaci/ | 
            GitHub: https://github.com/MelihTakyaci
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}