'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh, Object3D, Material, BufferGeometry } from 'three'
import * as THREE from 'three'

// Modeli önceden yükle
useGLTF.preload('/blackO.glb')

export default function PyraminxModel() {
  const group = useRef<Group>(null)
  const { scene } = useGLTF('/blackO.glb')

  // Görünürlük state'i: görünmüyorsa animasyonu durduracağız
  const [isVisible, setIsVisible] = useState(true)

  const clonedScene = useRef<Group | null>(null)

  useEffect(() => {
    if (scene && !clonedScene.current) {
      // GLTF sahnesini klonla (paylaşımlı referanslardan kaçınmak için)
      clonedScene.current = scene.clone(true) as Group

      clonedScene.current.traverse((object: Object3D) => {
        if (object instanceof Mesh) {
          object.frustumCulled = true

          // malzeme güncelle
          const mat = object.material
          if (mat) {
            if (Array.isArray(mat)) mat.forEach((m: Material) => (m.needsUpdate = true))
            else (mat as Material).needsUpdate = true
          }

          // geometry varsa bounding sphere hesapla
          const geo = object.geometry as BufferGeometry | undefined
          geo?.computeBoundingSphere()
        }
      })
    }

    return () => {
      // Temizlik: geometry/material dispose
      if (clonedScene.current) {
        clonedScene.current.traverse((object: Object3D) => {
          if (object instanceof Mesh) {
            const geo = object.geometry as BufferGeometry | undefined
            geo?.dispose()
            const mat = object.material
            if (mat) {
              if (Array.isArray(mat)) mat.forEach((m: Material) => m.dispose())
              else (mat as Material).dispose()
            }
          }
        })
      }
    }
  }, [scene])

  // Görünür değilse animasyonu çalıştırma
  useFrame((state, delta) => {
    if (!group.current || !isVisible) return
    const t = state.clock.getElapsedTime() * 0.25

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, t, 4, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, t * 0.6, 4, delta)
    group.current.position.y = Math.sin(t * 2) * 0.07
  })

  // Canvas görünürlük gözlemcisi
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
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
      scale={0.4}
      dispose={null}
    />
  )
}