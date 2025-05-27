import { useEffect } from 'react'
import { useBounds } from '@react-three/drei'

export default function ForceBoundsRefit() {
  const bounds = useBounds()

  useEffect(() => {
    const timeout = setTimeout(() => {
      bounds.refresh().fit()
    }, 100)

    return () => clearTimeout(timeout)
  }, [bounds])

  return null
}