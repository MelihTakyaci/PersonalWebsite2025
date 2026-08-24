'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EdgesGeometry, Group, LineSegments } from 'three'
import { buildPuzzle, type Puzzle } from '@/lib/pyraminx/pieces'
import { PyraminxEngine } from '@/lib/pyraminx/moves'
import { createPuzzleMaterials } from '@/lib/pyraminx/materials'
import type { MotionValue } from 'framer-motion'

useGLTF.preload('/black.glb')

const BASE_SCALE = 0.5

/** Radians per second of yaw. */
const YAW_SPEED = 0.1
/** Settled elevation, so the model is seen slightly from above. */
const RESTING_TILT = -0.22
/** How far the pointer can lean it, on top of the resting pose. */
const POINTER_TILT = 0.1

// ============================================================================
// PYRAMINX — 14 pieces that scramble and solve on a loop
// ============================================================================

type Props = {
  animate: boolean
  /** 0 = fully present, 1 = torn away. Driven by hero scroll progress. */
  glitch?: MotionValue<number>
}

export default function PyraminxModel({ animate, glitch }: Props) {
  const groupRef = useRef<Group>(null!)
  const puzzleRef = useRef<Puzzle | null>(null)
  const engineRef = useRef<PyraminxEngine | null>(null)

  // Local time accumulator. R3F's setFrameloop resets clock.elapsedTime to 0
  // every time the frameloop changes, so driving anything off state.clock would
  // snap the model back each time the scene scrolls out of view and returns.
  const elapsed = useRef(0)
  // Damped separately from group.rotation.x, which now also carries the resting
  // tilt and the slow oscillation; damping the rotation itself would fight them.
  const pointerTilt = useRef(0)

  const { scene } = useGLTF('/black.glb')
  const materials = useMemo(() => createPuzzleMaterials(), [])

  useEffect(() => {
    const group = groupRef.current
    if (!scene || !group) return

    const puzzle = buildPuzzle(scene, materials.surface)
    for (const piece of puzzle.pieces) {
      piece.object.add(
        new LineSegments(new EdgesGeometry(piece.object.geometry, 15), materials.edge)
      )
    }

    group.add(puzzle.root)
    puzzleRef.current = puzzle
    engineRef.current = new PyraminxEngine(puzzle)

    return () => {
      group.remove(puzzle.root)
      puzzle.root.traverse((object) => {
        const withGeometry = object as { geometry?: { dispose(): void } }
        withGeometry.geometry?.dispose()
      })
      puzzleRef.current = null
      engineRef.current = null
    }
  }, [scene, materials])

  // Reduced motion: drop straight back to the solved pose and hold it.
  useEffect(() => {
    if (!animate) engineRef.current?.reset()
  }, [animate])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    // Clamp so a long pause or a dropped frame cannot jump the animation.
    const step = Math.min(delta, 1 / 30)
    elapsed.current += step
    const t = elapsed.current

    // Entrance: 0.85 -> 1 over 1.2s on an ease-out cubic.
    const intro = Math.min(1, t / 1.2)
    const eased = 1 - Math.pow(1 - intro, 3)
    group.scale.setScalar(BASE_SCALE * (0.85 + 0.15 * eased))

    // Set even when motion is reduced: the scene still has to clear out of the
    // way as the page scrolls, it just does so without the tear or the fringe.
    materials.uniforms.uGlitch.value = glitch ? glitch.get() : 0
    materials.uniforms.uJitter.value = animate ? 1 : 0

    if (!animate) return

    materials.uniforms.uTime.value = t
    engineRef.current?.update(step)

    // Pose. A constant yaw at a fixed elevation shows the same silhouette
    // forever; the two slow, mutually prime oscillations keep tipping the model
    // so different faces come into the light, and the resting tilt frames it
    // the way a product shot would rather than edge-on.
    pointerTilt.current += (state.pointer.y * POINTER_TILT - pointerTilt.current) * Math.min(1, delta * 3)

    group.rotation.y = t * YAW_SPEED
    group.rotation.x = RESTING_TILT + Math.sin(t * 0.19) * 0.09 + pointerTilt.current
    group.rotation.z = Math.sin(t * 0.13) * 0.05
    group.position.y = Math.sin(t * 0.35) * 0.03
  })

  return <group ref={groupRef} />
}
