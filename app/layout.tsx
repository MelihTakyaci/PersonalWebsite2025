import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: 'Melih Takyaci | Full Stack Developer',
  description: 'Showcasing projects in Next.js, Fastify, PostgreSQL, ESP32, and YOLOv11n. Explore Melih Takyaci’s portfolio and work.',
  keywords: ['Melih Takyaci', 'Full Stack Developer', 'Next.js', 'Fastify', 'ESP32', 'OpenCV', 'Portfolio'],
  authors: [{ name: 'Melih Takyaci' }],
  creator: 'Melih Takyaci',
  openGraph: {
    title: 'Melih Takyaci',
    description: 'Explore the professional portfolio of Melih Takyaci, a Full Stack and Embedded Systems Developer with expertise in modern web technologies (Next.js, Fastify, PostgreSQL), real-time applications, and IoT systems. Specialized in AI-powered data analysis, embedded C/C++ for STM32 and ESP32, and DevOps pipelines using Docker and GitHub Actions. This portfolio showcases innovative projects in mobile development, cloud-based CMS platforms, computer vision with YOLOv11n and OpenCV, and scalable monorepo architectures for enterprise-grade applications.',
    url: 'https://your-domain.com',
    siteName: 'Melih Takyaci Portfolio',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 600,
        alt: 'Melih Takyaci Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melih Takyaci',
    description: 'Explore Melih Takyaci’s portfolio of cutting-edge tech projects.',
    creator: '@yourTwitterHandle',
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
