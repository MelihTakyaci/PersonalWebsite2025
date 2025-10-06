'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh } from 'three'
import * as THREE from 'three'

// R3F JSX uyumluluğu
extend({ Group, Mesh })

// Modeli önceden yükle
useGLTF.preload('/blackO.glb')

export default function PyraminxModel() {
  const group = useRef<Group>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { scene } = useGLTF('/blackO.glb')
  const { camera } = useThree()

  // Sahneyi klonla ve materyalleri okunur hâle getir
  const clonedScene = useMemo<Group | null>(() => {
    if (!scene) return null
    const cloned = scene.clone(true) as Group

    cloned.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return

      // Materyali biraz aç: koyu gri + yansıma, çok hafif emissive
      const apply = (m: any) => {
        if (!m) return
        if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
          m.color = new THREE.Color('#1e232a')         // siyah yerine koyu gri
          m.roughness = 0.3
          m.metalness = 0.55
          m.envMapIntensity = 1.0
          if ('clearcoat' in m) {
            m.clearcoat = 0.5
            m.clearcoatRoughness = 0.35
          }
          m.emissive = new THREE.Color('#0a0a0a')
          m.emissiveIntensity = 0.08
          m.needsUpdate = true
        }
      }

      if (Array.isArray(mesh.material)) mesh.material.forEach(apply)
      else apply(mesh.material)

      mesh.frustumCulled = true
      mesh.geometry?.computeBoundingSphere()
    })

    return cloned
  }, [scene])

  // Unmount temizliği
  useEffect(() => {
    return () => {
      if (!clonedScene) return
      clonedScene.traverse((obj) => {
        const m = obj as Mesh
        if (m.isMesh) {
          m.geometry?.dispose()
          const mat = m.material as any
          if (Array.isArray(mat)) mat.forEach((x) => x?.dispose?.())
          else mat?.dispose?.()
        }
      })
    }
  }, [clonedScene])

  // Hafif idle hareket (istersen kaldırabilirsin)
  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime() * 0.25
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, t, 4, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, t * 0.6, 4, delta)
    group.current.position.y = Math.sin(t * 2) * 0.07
  })

  // Görünürlük gözlemcisi (ileride performans için kullanabilirsin)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    const canvas = document.querySelector('canvas')
    if (canvas) observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Yüklenirken basit bir placeholder (artık koyu değil)
  if (!clonedScene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#222" metalness={0.4} roughness={0.4} />
      </mesh>
    )
  }

  return (
    <group ref={group} scale={0.4} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  )
}