'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import TextReveal from '@/components/motion/TextReveal'
import { duration, ease } from '@/lib/motion'

// Staged entrance: heading, then supporting line, then the scroll cue.
// Values come from the duration scale, not from taste.
const HEADING_DELAY = duration.sm
const LEAD_DELAY = duration.lg
const CUE_DELAY = duration.xl

const PyraminxCanvas = dynamic(() => import('@/components/PyraminxCanvas'), {
  ssr: false,
  loading: () => null,
})

export default function Hero() {
  const ref = useRef<HTMLElement>(null)

  // Progress through the hero block: 0 at the top, 1 once its end
  // reaches the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  // The scene does not move. An earlier version mapped scroll to scale and
  // position through a spring, which could not put the model back exactly where
  // it started once the sticky container released. Nothing travels now, so
  // there is no position to restore — it simply tears away and comes back.
  const glitch = useTransform(scrollYProgress, [0, 0.35], [0, 1])

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="hero-title"
      className="relative min-h-[170vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Scene */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[14vh] mx-auto h-[52vh] w-full max-w-[560px]"
        >
          <PyraminxCanvas glitch={glitch} />
        </div>

        {/* Type */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-[12vh] sm:px-10">
          <div className="mx-auto max-w-6xl">
            <TextReveal
              id="hero-title"
              as="h1"
              delay={HEADING_DELAY}
              lines={['Melih Takyaci']}
              className="text-display font-semibold text-fg-1"
            />
            <TextReveal
              as="p"
              delay={LEAD_DELAY}
              lines={[
                'Full-stack engineer building systems',
                'from silicon to screen.',
              ]}
              className="mt-5 max-w-2xl text-lead text-fg-2"
            />
            <motion.a
              href="#experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.lg, ease: ease.enter, delay: CUE_DELAY }}
              className="mt-10 inline-flex items-center gap-2 border-t border-line pt-4
                font-mono text-label uppercase text-fg-3 transition-colors hover:text-fg-1"
            >
              Selected work
              <span aria-hidden="true">↓</span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
