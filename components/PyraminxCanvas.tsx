import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Bounds } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import ForceBoundsRefit from './ForceBoundsRefit'

export default function PyraminxCanvas() {
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
      <Bounds fit clip observe margin={1.2}>
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