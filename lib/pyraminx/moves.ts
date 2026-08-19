// lib/pyraminx/moves.ts
// The turning engine: axes, layer membership, move execution, and the
// scramble -> solve cycle. Pure three.js so Node can verify it.
import * as THREE from 'three'
import { currentCentroid, type Piece, type Puzzle } from './pieces.ts'
import { duration, ease } from '../motion.ts'

export type AxisName = 'U' | 'F' | 'R' | 'L'
export type LayerName = 'tip' | 'axial'

export interface Move {
  axis: AxisName
  layer: LayerName
  /** +1 or -1 turn of 120 degrees about the axis. */
  turns: 1 | -1
}

/**
 * Exact vertex directions of the canonical tetrahedron, apex on +Y.
 *
 * These are analytic on purpose. The asset's measured axes agree to within
 * 0.64 degrees, but only a true symmetry axis maps a layer onto itself under a
 * 120 degree turn — a fraction of a degree of error would leave pieces proud
 * after every move and accumulate over a loop that never ends.
 */
export const AXES: Record<AxisName, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  F: new THREE.Vector3(0, -1 / 3, (2 * Math.SQRT2) / 3),
  R: new THREE.Vector3(Math.sqrt(6) / 3, -1 / 3, -Math.SQRT2 / 3),
  L: new THREE.Vector3(-Math.sqrt(6) / 3, -1 / 3, -Math.SQRT2 / 3),
}

export const AXIS_NAMES: AxisName[] = ['U', 'F', 'R', 'L']
export const TURN_ANGLE = (2 * Math.PI) / 3

/** Layer cuts as a fraction of the puzzle radius. Both sit in gaps wider than a
 *  quarter of the radius, so neither is delicate. */
const CUT = { tip: 0.6, axial: 0.15 } as const

export function layerMembers(puzzle: Puzzle, axis: AxisName, layer: LayerName): Piece[] {
  const direction = AXES[axis]
  const cut = CUT[layer] * puzzle.radius
  const centroid = new THREE.Vector3()
  return puzzle.pieces.filter((piece) => currentCentroid(piece, centroid).dot(direction) > cut)
}

export function invert(move: Move): Move {
  return { ...move, turns: move.turns === 1 ? -1 : 1 }
}

/** The solve is the scramble played backwards with every turn inverted, so no
 *  solver is needed — correctness is structural. */
export function solutionFor(scramble: Move[]): Move[] {
  return [...scramble].reverse().map(invert)
}

export function scramble(length: number, random: () => number = Math.random): Move[] {
  const moves: Move[] = []
  let previous: Move | null = null
  while (moves.length < length) {
    const axis = AXIS_NAMES[Math.floor(random() * AXIS_NAMES.length)]
    const layer: LayerName = random() < 0.35 ? 'tip' : 'axial'
    // Never turn the same axis twice in a row. Consecutive turns of one layer
    // collapse into a single turn and read as a stutter, and spreading
    // successive moves across corners is what makes the puzzle look like it is
    // being worked from every side rather than fiddled with in one place.
    if (previous && previous.axis === axis) continue
    const move: Move = { axis, layer, turns: random() < 0.5 ? 1 : -1 }
    moves.push(move)
    previous = move
  }
  return moves
}

// --- easing -----------------------------------------------------------------

/** Newton solve of a cubic-bezier easing, so turns carry the site's own curve
 *  rather than an approximation of it. */
function bezierEasing([x1, y1, x2, y2]: [number, number, number, number]) {
  const bez = (a: number, b: number, t: number) => {
    const u = 1 - t
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
  }
  return (x: number): number => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const error = bez(x1, x2, t) - x
      if (Math.abs(error) < 1e-6) break
      const u = 1 - t
      const slope = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2)
      if (Math.abs(slope) < 1e-9) break
      t -= error / slope
    }
    return bez(y1, y2, t)
  }
}

const easeTurn = bezierEasing(ease.enter)

// --- engine -----------------------------------------------------------------

const TIMING = {
  move: duration.sm,
  // Held deliberately short: the cycle should read as one continuous working
  // motion, not as a sequence of turns separated by pauses.
  gap: 0.01,
  holdScrambled: duration.xs,
  holdSolved: duration.lg,
} as const

const SCRAMBLE_LENGTH = 14

type Phase = 'scrambling' | 'holdScrambled' | 'solving' | 'holdSolved'

/**
 * Runs the endless scramble -> solve cycle. Call update(dt) once per frame;
 * call reset() to drop straight back to the solved pose.
 */
export class PyraminxEngine {
  private readonly pivot = new THREE.Object3D()
  private queue: Move[] = []
  private phase: Phase = 'holdSolved'
  private wait: number = TIMING.holdSolved
  private active: { move: Move; members: Piece[]; elapsed: number } | null = null

  private readonly puzzle: Puzzle
  private readonly random: () => number

  // Fields are declared and assigned explicitly rather than through
  // constructor parameter properties: that syntax is not erasable, and this
  // module must stay runnable under Node's type stripping so
  // scripts/verify-pyraminx.mjs can exercise the real engine.
  constructor(puzzle: Puzzle, random: () => number = Math.random) {
    this.puzzle = puzzle
    this.random = random
    this.pivot.name = 'PyraminxPivot'
    this.puzzle.root.add(this.pivot)
  }

  update(dt: number): void {
    if (this.active) {
      this.advance(dt)
      return
    }
    if (this.wait > 0) {
      this.wait -= dt
      return
    }
    this.next()
  }

  /** Abandon any turn in flight and restore the solved pose. */
  reset(): void {
    if (this.active) this.finish()
    this.queue = []
    this.active = null
    this.phase = 'holdSolved'
    this.wait = TIMING.holdSolved
    for (const piece of this.puzzle.pieces) {
      piece.object.position.set(0, 0, 0)
      piece.object.quaternion.identity()
      piece.object.updateMatrix()
    }
  }

  private next(): void {
    if (this.queue.length === 0) {
      if (this.phase === 'scrambling') {
        this.phase = 'holdScrambled'
        this.wait = TIMING.holdScrambled
        return
      }
      if (this.phase === 'holdScrambled') {
        this.phase = 'solving'
        this.queue = solutionFor(this.lastScramble)
        return
      }
      if (this.phase === 'solving') {
        this.phase = 'holdSolved'
        this.wait = TIMING.holdSolved
        return
      }
      this.lastScramble = scramble(SCRAMBLE_LENGTH, this.random)
      this.queue = [...this.lastScramble]
      this.phase = 'scrambling'
      return
    }
    this.begin(this.queue.shift()!)
  }

  private lastScramble: Move[] = []

  private begin(move: Move): void {
    const members = layerMembers(this.puzzle, move.axis, move.layer)
    this.puzzle.root.updateMatrixWorld(true)
    this.pivot.position.set(0, 0, 0)
    this.pivot.quaternion.identity()
    this.pivot.updateMatrixWorld(true)
    for (const piece of members) this.pivot.attach(piece.object)
    this.active = { move, members, elapsed: 0 }
  }

  private advance(dt: number): void {
    const active = this.active!
    active.elapsed += dt
    const progress = Math.min(1, active.elapsed / TIMING.move)
    const angle = TURN_ANGLE * active.move.turns * easeTurn(progress)
    this.pivot.quaternion.setFromAxisAngle(AXES[active.move.axis], angle)
    if (progress >= 1) this.finish()
  }

  /** Snap to exactly +/-120 degrees before handing the pieces back, so the
   *  lattice cannot drift over an unbounded number of turns. */
  private finish(): void {
    const active = this.active!
    this.pivot.quaternion.setFromAxisAngle(AXES[active.move.axis], TURN_ANGLE * active.move.turns)
    this.pivot.updateMatrixWorld(true)
    for (const piece of active.members) this.puzzle.root.attach(piece.object)
    this.pivot.quaternion.identity()
    this.pivot.updateMatrixWorld(true)
    this.active = null
    this.wait = TIMING.gap
  }
}

/** Apply a move instantly, with no animation. Used by the verification script. */
export function applyMove(puzzle: Puzzle, move: Move): void {
  const members = layerMembers(puzzle, move.axis, move.layer)
  const pivot = new THREE.Object3D()
  puzzle.root.add(pivot)
  puzzle.root.updateMatrixWorld(true)
  pivot.updateMatrixWorld(true)
  for (const piece of members) pivot.attach(piece.object)
  pivot.quaternion.setFromAxisAngle(AXES[move.axis], TURN_ANGLE * move.turns)
  pivot.updateMatrixWorld(true)
  for (const piece of members) puzzle.root.attach(piece.object)
  puzzle.root.remove(pivot)
}
