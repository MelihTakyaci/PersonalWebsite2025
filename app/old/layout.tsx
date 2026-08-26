// app/old/layout.tsx
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'
import './globals.css'


/**
 * The previous site, kept live at /old.
 *
 * This is a nested layout, so it carries no <html> or <body> — those belong to
 * the root layout and may appear only once per document. The original root
 * layout's font setup lives there too; the fonts it declared are the same two
 * the current site loads, so nothing is lost by dropping the duplicate.
 *
 * The archived stylesheet is imported here rather than at the root. It restates
 * `body` colours and a bare `*` rule, which would fight the live site's tokens
 * if it were loaded everywhere.
 */
export const metadata: Metadata = {
  // Just the segment name: the root layout's "%s | Melih Takyaci" template
  // supplies the rest, so spelling the name out here would repeat it.
  title: 'Previous Site',
  description:
    'The previous version of this site, kept online for reference.',
  // Superseded by the current site, so keep the archive out of search results
  // rather than competing with the live pages for the same terms.
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteUrl}/old` },
}

export default function OldSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="antialiased">{children}</div>
}
