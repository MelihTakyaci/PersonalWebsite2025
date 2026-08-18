// components/motion/TextReveal.tsx
'use client'

import { motion } from 'framer-motion'
import { duration, ease, stagger } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TAGS = { h1: motion.h1, h2: motion.h2, p: motion.p } as const

type Props = {
  /** One entry per visual line. The caller controls the line breaks. */
  lines: string[]
  as?: keyof typeof TAGS
  className?: string
  delay?: number
  id?: string
}

/**
 * Drives a heading up line-by-line from behind a mask.
 * Runs on mount, not on scroll — this is for above-the-fold headings.
 */
export default function TextReveal({
  lines,
  as = 'h1',
  className,
  delay = 0,
  id,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const Tag = TAGS[as]

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {lines.map((line) => (
        // pb/-mb pair keeps descenders (g, y, p) from being clipped by the mask.
        <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: reduced ? '0%' : '115%', opacity: reduced ? 0 : 1 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: { duration: duration.xl, ease: ease.enter },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
