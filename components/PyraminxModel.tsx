'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh } from 'three'
import * as THREE from 'three'

// Preload the model
useGLTF.preload('/black.glb')

export default function PyraminxModel() {
  const group = useRef<Group>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { scene } = useGLTF('/black.glb')
  const { camera } = useThree()
  
  // Create a stable clone of the scene to avoid issues
  const clonedScene = useRef<Group | null>(null)
  
  useEffect(() => {
    if (scene && !clonedScene.current) {
      clonedScene.current = scene.clone()
      
      // Optimize materials and geometry
      clonedScene.current.traverse((object) => {
        if (object instanceof Mesh) {
          // Enable frustum culling for better performance
          object.frustumCulled = true
          
          // Optimize material
          if (object.material) {
            object.material.needsUpdate = true
          }
          
          // Optimize geometry
          if (object.geometry) {
            object.geometry.computeBoundingSphere()
          }
        }
      })
    }
    
    // Cleanup function
    return () => {
      if (clonedScene.current) {
        clonedScene.current.traverse((object) => {
          if (object instanceof Mesh) {
            object.geometry?.dispose()
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material?.dispose()
            }
          }
        })
      }
    }
  }, [scene])

  // Frame-rate independent animation
  useFrame((state, delta) => {
    if (!group.current) return

    /* hedef açı: zamanla lineer artan bir radian değeri */
    const t = state.clock.getElapsedTime() * 0.25          // 0.25 = dönme hızı

    /* THREE.MathUtils.damp → her karede hedefe yumuşak yaklaşır */
    group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        t,
        4,           // damping (yüksek = daha pürüzsüz)
        delta,
    )
    group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        t * 0.6,     // biraz farklı x-hızı = hoş varyasyon
        4,
        delta,
    )

    /* hazır “Float” yerine kendi hafif salınım */
    group.current.position.y = Math.sin(t * 2) * 0.07      // ±0.07 unit
    })

  // Intersection observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const canvas = document.querySelector('canvas')
    if (canvas) {
      observer.observe(canvas)
    }

    return () => observer.disconnect()
  }, [])

  // Error boundary fallback
  if (!clonedScene.current) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    )
  }

  return (
    <primitive 
      object={clonedScene.current} 
      ref={group} 
      scale={0.15}
      dispose={null}
    />
  )
}

// Cleanup on unmount
useGLTF.clear = () => {
  useGLTF.preload.clear()
}