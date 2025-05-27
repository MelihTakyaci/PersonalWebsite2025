'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Bounds } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import ForceBoundsRefit from './ForceBoundsRefit'

export default function PyraminxCanvas() {
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCanvasReady(true)
    }, 150) // DOM otursun

    return () => clearTimeout(timeout)
  }, [])

  if (!canvasReady) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Bounds fit observe clip>
        <Center>
          <PyraminxModel />
        </Center>
        <ForceBoundsRefit />
      </Bounds>

      <ambientLight intensity={1.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.1} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}