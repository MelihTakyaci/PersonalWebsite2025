// lib/motion.ts
// The single source of every timing value on the site.
// Nothing in components/ may hardcode a duration, easing, or distance.
import type { Transition } from 'framer-motion'

/** Cubic-bezier curves. `enter` is the decelerating curve that gives the
 *  site its calm, settled feel; use it for anything the user sees arrive. */
export const ease = {
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
}

/** Physical response for anything the user is directly manipulating
 *  (hover, pointer tracking, scroll-linked transforms). */
export const spring: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
}

/** Seconds. */
export const duration = {
  xs: 0.16,
  sm: 0.24,
  md: 0.4,
  lg: 0.64,
  xl: 0.9,
} as const

/** Pixels of travel for entrance transforms. */
export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
} as const

/** Seconds between staggered siblings. */
export const stagger = 0.06

/** Shared viewport trigger: fire once, when a quarter of the block is visible. */
export const viewportOnce = { once: true, amount: 0.25 } as const
