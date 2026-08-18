// components/motion/Stagger.tsx
'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { distance, duration, ease, stagger, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const PARENT_TAGS = { div: motion.div, ul: motion.ul } as const
const ITEM_TAGS = { div: motion.div, li: motion.li, article: motion.article } as const

type ParentProps = {
  children: ReactNode
  /** Seconds before the first child starts. */
  delay?: number
  as?: keyof typeof PARENT_TAGS
  className?: string
}

/** Sequences its StaggerItem children. Do not nest Reveal inside this:
 *  framer-motion stops propagating variants to a child that declares its
 *  own initial/whileInView, so the stagger would silently do nothing. */
export function Stagger({ children, delay = 0, as = 'div', className }: ParentProps) {
  const reduced = usePrefersReducedMotion()
  const Tag = PARENT_TAGS[as]

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
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
      {children}
    </Tag>
  )
}

type ItemProps = {
  children: ReactNode
  y?: keyof typeof distance
  as?: keyof typeof ITEM_TAGS
  className?: string
}

/** A single sequenced child. Inherits its animation state from Stagger. */
export function StaggerItem({ children, y = 'md', as = 'div', className }: ItemProps) {
  const reduced = usePrefersReducedMotion()
  const Tag = ITEM_TAGS[as]

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : distance[y] },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduced ? duration.sm : duration.lg,
            ease: ease.enter,
          },
        },
      }}
    >
      {children}
    </Tag>
  )
}
