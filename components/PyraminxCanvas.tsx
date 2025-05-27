import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Center, Bounds } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import { useMemo, useEffect } from 'react'

function ForceRerenderOnce() {
  const { invalidate } = useThree()

  useEffect(() => {
    const timeout = setTimeout(() => {
      invalidate() // sahneyi zorla yeniden çiz
    }, 100) // kısa bir gecikme yeterli
    return () => clearTimeout(timeout)
  }, [invalidate])

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
        {/* İlk yüklemede zorla redraw */}
        <ForceRerenderOnce />

        <Bounds fit clip observe margin={1.2}>
          <Center>
            <PyraminxModel />
          </Center>
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