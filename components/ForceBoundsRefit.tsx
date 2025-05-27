import { useEffect } from 'react'
import { useBounds } from '@react-three/drei'

export default function ForceBoundsRefit() {
  const bounds = useBounds()

  useEffect(() => {
    requestAnimationFrame(() => {
      bounds.refresh().fit()
    })
  }, [])

  return null
}