// components/motion/FocusRail.tsx
'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { focus, glitch, springOptions } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/** Index of the row currently in focus, shared down the rail. Whole numbers
 *  only — the rail steps between rows rather than sliding through them. */
const ActiveContext = createContext<MotionValue<number> | null>(null)

/** The shader's hash, so both effects tear on the same pseudo-random sequence. */
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453123
  return x - Math.floor(x)
}

type RailProps = {
  children: ReactNode
  /** How many items the rail steps through. */
  count: number
  className?: string
}

/**
 * Turns its own scrolled length into a stepping focus index.
 *
 * Which row is lit is authored by the section's progress rather than read off
 * each row's position on screen, so exactly one row peaks at a time no matter
 * how many happen to be visible at once.
 *
 * The `data-rail` hook lets globals.css drop the pin under
 * prefers-reduced-motion: the extra height only pays for the scroll-driven
 * focus, so with motion off it would be empty screens to scroll past.
 */
export function FocusRail({ children, count, className }: RailProps) {
  const ref = useRef<HTMLDivElement>(null)

  // 0 when the section's top reaches the top of the viewport — the moment the
  // pin engages — and 1 when its bottom reaches the bottom and the pin lets go.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // Rounded, not continuous: the page keeps scrolling smoothly underneath, but
  // the only thing on screen that moves is the focus, and it lands on one row
  // at a time.
  const last = Math.max(0, count - 1)
  const active = useTransform(scrollYProgress, (p) => Math.round(p * last))

  return (
    <div ref={ref} data-rail className={className}>
      <ActiveContext.Provider value={active}>{children}</ActiveContext.Provider>
    </div>
  )
}

type ItemProps = {
  children: ReactNode
  /** This row's position in the rail. */
  index: number
  className?: string
}

/** One row of a FocusRail. Needs a positioned `perspective` on its parent. */
export function FocusRailItem({ children, index, className }: ItemProps) {
  const reduced = usePrefersReducedMotion()

  // Stands in when a row is rendered outside a rail, so the hooks below never
  // depend on whether the context is there.
  const standalone = useMotionValue(0)
  const active = useContext(ActiveContext) ?? standalone

  // Signed: negative for rows above the focused one, positive for those below.
  // The sign is what tilts the two halves in opposite directions.
  const offset = useTransform(active, (current) => index - current)

  // One spring, then derive everything from it. Springing each property
  // separately would cost four animations per row and let them drift apart.
  const smooth = useSpring(offset, springOptions)

  const range = [-focus.falloff, 0, focus.falloff]
  const still: [number, number, number] = [0, 0, 0]

  const opacity = useTransform(smooth, range, reduced ? [1, 1, 1] : [focus.dim, 1, focus.dim])
  const scale = useTransform(
    smooth,
    range,
    reduced ? [1, 1, 1] : [focus.recede, focus.peak, focus.recede]
  )
  const rotateX = useTransform(smooth, range, reduced ? still : [focus.tilt, 0, -focus.tilt])
  const z = useTransform(smooth, range, reduced ? still : [-focus.depth, 0, -focus.depth])

  // 0 when this row holds focus, 1 once it is fully receded. Drives how hard it
  // blurs and how far it tears, so the row being read stays intact while the
  // ones behind it come apart.
  const recession = useTransform(smooth, (v) => Math.min(1, Math.abs(v) / focus.falloff))

  // Burst amplitude, kicked to 1 on every step and falling back to 0.
  const burst = useMotionValue(0)
  const tear = useMotionValue(0)
  const tick = useRef(-1)

  useMotionValueEvent(active, 'change', () => {
    if (reduced) return
    animate(burst, [1, 0], { duration: glitch.decay, ease: 'linear' })
  })

  useAnimationFrame((time) => {
    const amount = burst.get() * recession.get()
    if (amount <= 0.001) {
      if (tear.get() !== 0) tear.set(0)
      tick.current = -1
      return
    }
    // Re-seed on a fixed tick instead of every frame: holding each offset for a
    // beat is what separates a digital tear from a smooth shake.
    const beat = Math.floor((time / 1000) * glitch.rate)
    if (beat === tick.current) return
    tick.current = beat
    tear.set((hash(index * 12.9898 + beat * 7.13) * 2 - 1) * amount * glitch.tear)
  })

  // Resolves to `none`, not `blur(0px)`, once the row is in focus: a filter of
  // any radius forces the row to rasterise, which softens the very text the
  // reader is on. The swap happens mid-step, where the movement hides it.
  const filter = useTransform(
    [recession, burst] as MotionValue<number>[],
    ([r, b]: number[]) => {
      if (reduced) return 'none'
      const radius = r * focus.blur + b * r * glitch.spike
      return radius < 0.05 ? 'none' : `blur(${radius}px)`
    }
  )

  return (
    <motion.div
      className={className}
      style={{ opacity, scale, rotateX, z, x: tear, filter }}
    >
      {children}
    </motion.div>
  )
}
