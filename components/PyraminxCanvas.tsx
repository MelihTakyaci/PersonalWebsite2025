/* PyraminxCanvas.tsx – Stage’i bırakıp Center/Bounds kullanalım */
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Bounds } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import { useMemo } from 'react'

export default function PyraminxCanvas() {
  const memoizedCanvas = useMemo(
    () => (
      <Canvas
        /* nispeten yakın kamera, geniş FOV → mobilde bile taşmaz */
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{
          width: '100%',
          height: '100%',
          willChange: 'transform',
          isolation: 'isolate',
          pointerEvents: 'auto',
        }}
        gl={{ preserveDrawingBuffer: true }} /* scroll sonrası redraw koruması */
      >
        {/* Bounds + fit → modeli tam sığdırır; clip yok */}
        <Bounds fit clip observe margin={1.2}>
          <Center>
            <PyraminxModel />
          </Center>
        </Bounds>

        {/* yumuşak aydınlatma, gölge planesiz */}
        <ambientLight intensity={1.4} />
        <directionalLight position={[10, 10, 10]} intensity={1.1} />

        <OrbitControls enableZoom={false} />
      </Canvas>
    ),
    [],
  )

  return memoizedCanvas
}