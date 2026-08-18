// lib/usePrefersReducedMotion.ts
'use client'

import { useEffect, useState } from 'react'

/**
 * Only motion primitives call this. Section components must not —
 * reduced-motion handling is the primitives' responsibility.
 *
 * Starts false so server and first client render agree, then corrects
 * in an effect. A single frame of motion before correcting is acceptable;
 * the CSS safety net in globals.css covers class-based transitions.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
