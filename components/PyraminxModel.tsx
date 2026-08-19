'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EdgesGeometry, Group, LineSegments } from 'three'
import { buildPuzzle, type Puzzle } from '@/lib/pyraminx/pieces'
import { PyraminxEngine } from '@/lib/pyraminx/moves'
import { createEdgeMaterial, createSweepMaterial } from '@/lib/pyraminx/sweepMaterial'

useGLTF.preload('/black.glb')

const BASE_SCALE = 0.5

// ============================================================================
// PYRAMINX — 14 pieces that scramble and solve on a loop
// ============================================================================

export default function PyraminxModel({ animate }: { animate: boolean }) {
  const groupRef = useRef<Group>(null!)
  const puzzleRef = useRef<Puzzle | null>(null)
  const engineRef = useRef<PyraminxEngine | null>(null)

  // Local time accumulator. R3F's setFrameloop resets clock.elapsedTime to 0
  // every time the frameloop changes, so driving anything off state.clock would
  // snap the model back each time the scene scrolls out of view and returns.
  const elapsed = useRef(0)

  const { scene } = useGLTF('/black.glb')
  const material = useMemo(() => createSweepMaterial(), [])
  const edgeMaterial = useMemo(() => createEdgeMaterial(), [])

  useEffect(() => {
    if (!scene || !groupRef.current) return

    const puzzle = buildPuzzle(scene, material)
    for (const piece of puzzle.pieces) {
      piece.object.add(new LineSegments(new EdgesGeometry(piece.object.geometry, 15), edgeMaterial))
    }

    groupRef.current.add(puzzle.root)
    puzzleRef.current = puzzle
    engineRef.current = new PyraminxEngine(puzzle)

    return () => {
      groupRef.current?.remove(puzzle.root)
      puzzle.root.traverse((object) => {
        const withGeometry = object as { geometry?: { dispose(): void } }
        withGeometry.geometry?.dispose()
      })
      puzzleRef.current = null
      engineRef.current = null
    }
  }, [scene, material, edgeMaterial])

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

    if (!animate) return

    material.sweep.uTime.value = t
    engineRef.current?.update(step)

    group.rotation.y = t * 0.08
    group.position.y = Math.sin(t * 0.4) * 0.02

    // Damped tilt toward the pointer.
    const targetTilt = state.pointer.y * 0.12
    group.rotation.x += (targetTilt - group.rotation.x) * Math.min(1, delta * 3)
  })

  return <group ref={groupRef} />
}
