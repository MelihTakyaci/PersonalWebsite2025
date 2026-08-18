'use client'
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'

export default function PyraminxCanvas() {
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCanvasReady(true)
    }, 250)
    return () => clearTimeout(timeout)
  }, [])

  if (!canvasReady) return null

  return (
    <Canvas
      camera={{ 
        position: [0, 0, 4.5], 
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
      gl={{ 
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true
      }}
      dpr={[1, 2]} // Device pixel ratio limits
      performance={{ min: 0.5 }} // Performance degradation threshold
    >
      {/* Subtle lighting for dark glossy look */}
      <ambientLight intensity={0.15} color="#ffffff" />
      
      {/* Main top light - soft white */}
      <spotLight
        position={[0, 10, 5]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.5}
        color="#ffffff"
      />
      
      {/* Fill light from front-left */}
      <directionalLight
        position={[-5, 5, 10]}
        intensity={0.8}
        color="#ffffff"
      />
      
      {/* Subtle rim light for edge definition */}
      <pointLight
        position={[5, 0, -5]}
        intensity={0.5}
        color="#888888"
        distance={20}
        decay={2}
      />

      {/* Model without Bounds/Center wrapping */}
      <PyraminxModel />

      {/* Simplified OrbitControls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.55}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI - Math.PI / 4}
      />
    </Canvas>
  )
}