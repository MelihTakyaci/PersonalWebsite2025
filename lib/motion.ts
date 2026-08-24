// lib/motion.ts
// The single source of every timing value on the site.
// Nothing in components/ may hardcode a duration, easing, or distance.
import type { SpringOptions, Transition } from 'framer-motion'

/** Cubic-bezier curves. `enter` is the decelerating curve that gives the
 *  site its calm, settled feel; use it for anything the user sees arrive. */
export const ease = {
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
}

/** Physical response for anything the user is directly manipulating
 *  (hover, pointer tracking, scroll-linked transforms).
 *
 *  Two exports, one set of constants: framer-motion's `transition` prop wants
 *  a Transition (which carries `type`), while useSpring() wants SpringOptions
 *  (which does not). Keep them derived from SPRING so they cannot drift. */
const SPRING = { stiffness: 220, damping: 30, mass: 0.9 } as const

/** For `transition` props. */
export const spring: Transition = { type: 'spring', ...SPRING }

/** For useSpring(). */
export const springOptions: SpringOptions = SPRING

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

/** Scroll-linked focus rail. Exactly one row is in focus at a time; the rest
 *  fall back, dim, and tilt away, so the list reads as a shallow cylinder
 *  turning past the reader.
 *
 *  `dim` is a legibility trade, not a taste one. Lower looks more dramatic and
 *  pushes the unfocused rows under a comfortable contrast ratio. */
export const focus = {
  /** Opacity of a row fully out of focus. */
  dim: 0.45,
  /** Scale of the row in focus. */
  peak: 1.06,
  /** Scale of a row fully out of focus. */
  recede: 0.96,
  /** Degrees of X-rotation at full recession. Deliberately shallow: text under
   *  a steep rotateX goes soft on displays that rasterise before compositing. */
  tilt: 7,
  /** Pixels pushed back in Z at full recession. */
  depth: 80,
  /** How many rows from the focused one before a row is fully receded. */
  falloff: 1.6,
  /** Steady blur, in px, on a fully receded row.
   *
   *  Animating `filter` is the one deliberate exception to this project's
   *  "transform and opacity only" rule. It is affordable here because the rail
   *  steps rather than scrubs: the radius changes during a step and then holds,
   *  instead of re-rasterising on every scroll frame. */
  blur: 3,
} as const

/** The signal fault the rail shares with the pyraminx shader in
 *  lib/pyraminx/glitch.ts. Same vocabulary on purpose — horizontal tear across
 *  slices, re-seeded on a fixed tick rather than eased — so the two read as one
 *  effect rather than two unrelated tricks. Each row is a slice here. */
export const glitch = {
  /** Re-seed rate in Hz. The shader uses floor(uTime * 18.0); matching it is
   *  what makes the tear look digital instead of like a wobble. */
  rate: 18,
  /** Pixels of horizontal tear at full amplitude. */
  tear: 8,
  /** Extra blur, in px, at the peak of a burst. */
  spike: 4,
  /** Seconds for a burst to fall back to nothing. */
  decay: 0.22,
} as const

/** Seconds between staggered siblings. */
export const stagger = 0.06

/** Shared viewport trigger: fire once, when a quarter of the block is visible. */
export const viewportOnce = { once: true, amount: 0.25 } as const
