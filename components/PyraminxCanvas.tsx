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
      {/* Enhanced Lighting setup */}
      <ambientLight intensity={0.8} color="#f0f8ff" />
      
      {/* Key light - main illumination */}
      <directionalLight
        position={[6, 8, 12]}
        intensity={2.1}
        color={'#ffffff'}
        castShadow
      />
      
      {/* Fill light - reduces harsh shadows */}
      <directionalLight
        position={[-4, 3, 8]}
        intensity={0.9}
        color={'#e6f3ff'}
      />
      
      {/* Rim light - creates edge definition */}
      <directionalLight
        position={[2, 12, -8]}
        intensity={0.9}
        color={'#fff5e6'}
      />
      
      {/* Accent point light for sparkle */}
      <pointLight
        position={[3, 2, 4]}
        intensity={0.9}
        color={'#ff6b6b'}
        distance={10}
        decay={1}
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