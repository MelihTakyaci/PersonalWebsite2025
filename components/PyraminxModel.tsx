'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh, EdgesGeometry, LineSegments, LineBasicMaterial } from 'three'
import * as THREE from 'three'

useGLTF.preload('/blackO.glb')

// ============================================================================
// PYRAMINX - Static Display with Subtle Edges
// ============================================================================

export default function PyraminxModel() {
  const groupRef = useRef<Group>(null!)
  const { scene } = useGLTF('/blackO.glb')

  // Initialize - just load and style, no animation tracking
  useEffect(() => {
    if (!scene || !groupRef.current) return

    // Clear any existing children
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0])
    }

    scene.traverse((obj) => {
      if (obj instanceof Mesh && obj.geometry) {
        const m = obj.clone() as Mesh

        // Dark satin/semi-gloss material - like the reference image
        m.material = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
          metalness: 0.3,
          roughness: 0.4,
          emissive: 0x000000,
          emissiveIntensity: 0,
        })

        // Subtle edge highlight
        const edges = new EdgesGeometry(obj.geometry, 15)
        const line = new LineSegments(
          edges,
          new LineBasicMaterial({ 
            color: 0x555555,
            opacity: 0.4, 
            transparent: true 
          })
        )
        m.add(line)

        groupRef.current!.add(m)
      }
    })
  }, [scene])

  // Simple idle rotation - no solve animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y = t * 0.08
      // Gentle floating
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.02
    }
  })

  return <group ref={groupRef} scale={0.5} />
}
