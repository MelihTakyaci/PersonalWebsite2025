// components/motion/Magnetic.tsx
'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { springOptions } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type Props = {
  children: ReactNode
  /** Maximum travel toward the cursor, in pixels. */
  strength?: number
  className?: string
}

/** Translates toward the cursor and springs back. Mouse only. */
export default function Magnetic({ children, strength = 6, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, springOptions)
  const y = useSpring(rawY, springOptions)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    // Touch and pen never get the effect — this is the mobile opt-out.
    if (reduced || event.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    rawX.set(dx * strength)
    rawY.set(dy * strength)
  }

  const handleLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}
