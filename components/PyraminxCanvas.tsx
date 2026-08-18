'use client'
import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export default function PyraminxCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [inView, setInView] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 250)
    return () => clearTimeout(timeout)
  }, [])

  // Stop rendering entirely once the scene scrolls away.
  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="h-full w-full">
      {mounted && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 0, 4.5], fov: 45, near: 0.1, far: 1000 }}
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={0.15} color="#ffffff" />
          <spotLight position={[0, 10, 5]} angle={0.5} penumbra={0.8} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-5, 5, 10]} intensity={0.8} color="#ffffff" />
          <pointLight position={[5, 0, -5]} intensity={0.5} color="#888888" distance={20} decay={2} />

          <PyraminxModel animate={!reduced} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.55}
            target={[0, 0, 0]}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI - Math.PI / 4}
          />
        </Canvas>
      )}
    </div>
  )
}
