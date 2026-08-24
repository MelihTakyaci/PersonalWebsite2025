import { useEffect } from 'react'
import { useBounds } from '@react-three/drei'

export default function ForceBoundsRefit() {
  const bounds = useBounds()

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      bounds.refresh().fit()
    })

    return () => cancelAnimationFrame(raf)
  }, [bounds])

  return null
}