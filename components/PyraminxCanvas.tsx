import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Bounds, useBounds } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import { useMemo, useEffect } from 'react'

function ForceRefitOnce() {
  const api = useBounds()

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.refresh().fit()  // tekrar fit ettir
    }, 300)
    return () => clearTimeout(timeout)
  }, [api])

  return null
}

export default function PyraminxCanvas() {
  const memoizedCanvas = useMemo(
    () => (
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{
          width: '100%',
          height: '100%',
          willChange: 'transform',
          isolation: 'isolate',
          pointerEvents: 'auto',
        }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Bounds fit clip observe margin={1.2}>
          <Center>
            <PyraminxModel />
          </Center>
          <ForceRefitOnce />
        </Bounds>

        <ambientLight intensity={1.4} />
        <directionalLight position={[10, 10, 10]} intensity={1.1} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    ),
    [],
  )

  return memoizedCanvas
}