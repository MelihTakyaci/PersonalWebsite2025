'use client'

import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import Reveal from '@/components/motion/Reveal'
import {
  ORCID,
  ORCID_URL,
  SCHOLAR_URL,
  publications,
} from '@/lib/publications'

const TYPE_LABEL: Record<string, string> = {
  article: 'Journal article',
  chapter: 'Book chapter',
  conference: 'Conference paper',
}

/**
 * The published record, in the open.
 *
 * Structured data alone is a claim a crawler has to take on trust; the same
 * citations rendered as real text, linked to their DOIs, are what a reader and
 * a verifier can both follow. Only published work appears here — the entries
 * are the ones that resolve.
 */
export default function Publications() {
  return (
    <>
      <Stagger as="ul" className="border-b border-line">
        {publications.map((p, index) => {
          const citation = (
            <>
              <span className="text-fg-1">{p.title}</span>
              <span className="text-fg-3">
                {' — '}
                {p.venue}
                {p.detail ? `, ${p.detail}` : ''}
              </span>
            </>
          )

          return (
            <StaggerItem
              as="li"
              key={p.title}
              className="group border-t border-line transition-colors duration-300 hover:bg-ink-1/50"
            >
              <div className="grid grid-cols-1 gap-3 px-2 py-8 md:grid-cols-12 md:gap-8 md:px-4">
                <span className="font-mono text-label uppercase text-fg-3 md:col-span-1">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="md:col-span-3">
                  <span className="font-mono text-label uppercase text-fg-3">
                    {TYPE_LABEL[p.type]}
                  </span>
                  <p className="mt-1 font-mono text-label text-fg-3">{p.year}</p>
                </div>

                <div className="md:col-span-8">
                  <p className="text-body">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-accent"
                      >
                        {citation}
                      </a>
                    ) : (
                      citation
                    )}
                  </p>
                  {p.doi && (
                    <p className="mt-2 font-mono text-label text-fg-3">DOI {p.doi}</p>
                  )}
                </div>
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>

      <Reveal className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
        <a
          href={ORCID_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-label uppercase text-fg-3 transition-colors hover:text-accent"
        >
          ORCID {ORCID}
        </a>
        <a
          href={SCHOLAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-label uppercase text-fg-3 transition-colors hover:text-accent"
        >
          Google Scholar
        </a>
      </Reveal>
    </>
  )
}
