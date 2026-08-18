// components/motion/Reveal.tsx
'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { distance, duration, ease, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TAGS = { div: motion.div, section: motion.section } as const

type Props = {
  children: ReactNode
  /** Seconds to wait after the block enters the viewport. */
  delay?: number
  /** How far the block travels up. */
  y?: keyof typeof distance
  as?: keyof typeof TAGS
  className?: string
}

/** Standalone scroll-entrance. For lists, use Stagger + StaggerItem instead. */
export default function Reveal({
  children,
  delay = 0,
  y = 'md',
  as = 'div',
  className,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const Tag = TAGS[as]

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : distance[y] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{
        duration: reduced ? duration.sm : duration.lg,
        ease: ease.enter,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </Tag>
  )
}
