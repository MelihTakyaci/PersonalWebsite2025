'use client'

import { SiGooglescholar } from 'react-icons/si'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import { duration } from '@/lib/motion'

const SCHOLAR_URL = 'https://scholar.google.com/citations?user=XFKVJ54AAAAJ'

/**
 * Fixed to the bottom-right corner, so the publication record is reachable
 * from anywhere on the page. At rest it is only the mark; the label slides
 * out from behind it on hover or keyboard focus.
 *
 * The label travels on transform and opacity alone — nothing here animates
 * width, so the pill never reflows the corner it sits in.
 */
export default function ScholarLink() {
  return (
    <Reveal delay={duration.xl} className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">
      <Magnetic className="inline-block">
        <a
          href={SCHOLAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Melih Takyaci's Google Scholar profile"
          className="group relative flex min-h-[48px] min-w-[48px] items-center justify-center"
        >
          <span
            aria-hidden="true"
            className="surface pointer-events-none absolute right-full mr-3 whitespace-nowrap
              rounded-full px-4 py-2 font-mono text-label uppercase text-fg-2
              translate-x-2 opacity-0 transition-[transform,opacity] duration-300 ease-enter
              group-hover:translate-x-0 group-hover:opacity-100
              group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          >
            Google Scholar
          </span>

          <span
            className="surface flex h-12 w-12 items-center justify-center rounded-full
              text-fg-2 transition-colors duration-300 ease-enter group-hover:text-accent"
          >
            <SiGooglescholar className="text-lg" aria-hidden="true" />
          </span>
        </a>
      </Magnetic>
    </Reveal>
  )
}
