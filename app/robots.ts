// app/robots.ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * Generated rather than served from public/, so the sitemap and host lines
 * follow whatever domain the deployment is actually on.
 *
 * The archive under /old is deliberately disallowed: its pages already carry
 * noindex, and pointing crawlers at a superseded copy of the site only splits
 * signals between two versions of the same content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/old',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
