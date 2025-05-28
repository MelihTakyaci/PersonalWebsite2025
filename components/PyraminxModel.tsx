'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh } from 'three'
import * as THREE from 'three'

// ⚠️ CRITICAL FIX: Declare these for R3F JSX compatibility
extend({ Group, Mesh })

// Preload the model
useGLTF.preload('/blackO.glb')

export default function PyraminxModel() {
  const group = useRef<Group>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVisible, setIsVisible] = useState(true)
  const { scene } = useGLTF('/blackO.glb')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { camera } = useThree()

  const clonedScene = useRef<Group | null>(null)

  useEffect(() => {
    if (scene && !clonedScene.current) {
      clonedScene.current = scene.clone()

      clonedScene.current.traverse((object) => {
        if (object instanceof Mesh) {
          object.frustumCulled = true
          if (object.material) object.material.needsUpdate = true
          if (object.geometry) object.geometry.computeBoundingSphere()
        }
      })
    }

    return () => {
      if (clonedScene.current) {
        clonedScene.current.traverse((object) => {
          if (object instanceof Mesh) {
            object.geometry?.dispose()
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose())
            } else {
              object.material?.dispose()
            }
          }
        })
      }
    }
  }, [scene])

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime() * 0.25

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      t,
      4,
      delta,
    )

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      t * 0.6,
      4,
      delta,
    )

    group.current.position.y = Math.sin(t * 2) * 0.07
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const canvas = document.querySelector('canvas')
    if (canvas) observer.observe(canvas)

    return () => observer.disconnect()
  }, [])

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