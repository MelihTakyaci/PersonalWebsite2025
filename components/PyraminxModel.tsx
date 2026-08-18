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

export default function PyraminxModel({ animate }: { animate: boolean }) {
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
            // Brightened so the near-black body still reads as a wireframe
            // object against the neutral #08090A ground.
            color: 0x9aa0a8,
            opacity: 0.75,
            transparent: true
          })
        )
        m.add(line)

        groupRef.current!.add(m)
      }
    })
  }, [scene])

  const BASE_SCALE = 0.5

  // Local time accumulator. R3F's setFrameloop resets clock.elapsedTime to 0
  // every time the frameloop changes, so driving rotation or the entrance off
  // state.clock would snap the model back to its start pose each time the
  // scene scrolls out of view and returns.
  const elapsed = useRef(0)

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return

    // Clamp so a long pause or a dropped frame cannot jump the animation.
    elapsed.current += Math.min(delta, 1 / 30)
    const t = elapsed.current

    // Entrance: 0.85 -> 1 over 1.2s on an ease-out cubic.
    const intro = Math.min(1, t / 1.2)
    const eased = 1 - Math.pow(1 - intro, 3)
    group.scale.setScalar(BASE_SCALE * (0.85 + 0.15 * eased))

    if (!animate) return

    group.rotation.y = t * 0.08
    group.position.y = Math.sin(t * 0.4) * 0.02

    // Damped tilt toward the pointer.
    const targetTilt = _state.pointer.y * 0.12
    group.rotation.x += (targetTilt - group.rotation.x) * Math.min(1, delta * 3)
  })

  return <group ref={groupRef} />
}
