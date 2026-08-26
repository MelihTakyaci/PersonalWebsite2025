// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * Replaces the next-sitemap postbuild step, which baked a fixed domain into a
 * file committed under public/ and had to be regenerated — and re-committed —
 * on every build. Resolving the host here keeps the sitemap correct on any
 * domain without a build artefact in the tree.
 *
 * /old is excluded on purpose: it is served with noindex, so listing it would
 * invite crawls of a page that then refuses to be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
