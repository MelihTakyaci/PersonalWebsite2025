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

    // Centre the assembled group on its true centroid so rotation.y spins it
    // in place. This must be the *vertex* centroid, not the bounding-box
    // centre: a tetrahedron's bbox centre sits well off its centroid (1.05 in
    // one axis, 0.75 in another for this model), and pivoting there swings the
    // model through an arc of that radius. As shipped the GLB is already
    // centred to within 0.005 units, so this is normally a no-op — it is here
    // to stay correct if the asset is ever re-exported off-centre.
    const centroid = new THREE.Vector3()
    const vertex = new THREE.Vector3()
    let vertexCount = 0
    for (const child of groupRef.current.children) {
      const mesh = child as Mesh
      const position = mesh.geometry?.attributes.position
      if (!position) continue
      mesh.updateMatrix()
      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrix)
        centroid.add(vertex)
        vertexCount++
      }
    }
    if (vertexCount > 0) {
      centroid.divideScalar(vertexCount)
      for (const child of groupRef.current.children) child.position.sub(centroid)
    }
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
