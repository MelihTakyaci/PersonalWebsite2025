// lib/pyraminx/pieces.ts
// Turns the loaded GLB into 14 independently movable puzzle pieces.
//
// Pure three.js — no React, no browser APIs — so scripts/verify-pyraminx.mjs
// can exercise exactly the code the component runs.
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type PieceRole = 'tip' | 'axial' | 'edge'

export interface Piece {
  /** "Piece001" */
  id: string
  role: PieceRole
  /** Sorted sticker letters, e.g. "BGY". Two letters means an edge. */
  colors: string
  /** Lives directly under the puzzle root; its transform is what a move changes. */
  object: THREE.Mesh
  /** Centroid in the piece's own space. Constant; project it to find the current one. */
  centroidLocal: THREE.Vector3
}

export interface Puzzle {
  root: THREE.Group
  pieces: Piece[]
  /** Longest centroid distance from the centre — the scale layer cuts are taken from. */
  radius: number
}

/** Narrow luminance ramp. Four steps inside the dark end of the grey scale:
 *  enough to read a solved face as uniform, not enough to read as colour. */
const STICKER_RAMP: Record<string, number> = {
  Y: 0x3a3c40,
  B: 0x2c2e32,
  G: 0x212327,
  R: 0x17181b,
}
const BODY_COLOUR = 0x101113

const PIECE_ID = /^(Piece\d+)/
const STICKER = /_Sticker_([A-Z])-P/

type Collected = { geometries: THREE.BufferGeometry[]; colors: Set<string> }

/** Strip a source mesh down to position + normal + colour, baked into root space. */
function prepare(mesh: THREE.Mesh, hex: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()

  const position = source.getAttribute('position') as THREE.BufferAttribute
  geometry.setAttribute('position', position.clone())

  const normal = source.getAttribute('normal')
  if (normal) {
    geometry.setAttribute('normal', (normal as THREE.BufferAttribute).clone())
  } else {
    geometry.computeVertexNormals()
  }

  geometry.applyMatrix4(mesh.matrixWorld)

  const colour = new THREE.Color(hex)
  const count = geometry.getAttribute('position').count
  const colours = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    colours[i * 3] = colour.r
    colours[i * 3 + 1] = colour.g
    colours[i * 3 + 2] = colour.b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))

  if (source !== mesh.geometry) source.dispose()
  return geometry
}

/**
 * Group the GLB's meshes into pieces, merge each piece into one geometry, and
 * recentre the whole puzzle on its vertex centroid.
 *
 * The centroid must come from the vertices, not the bounding box: a
 * tetrahedron's bbox centre sits about a unit off its centroid, and pivoting
 * there swings the model through an arc of that radius.
 */
export function buildPuzzle(scene: THREE.Object3D, material: THREE.Material): Puzzle {
  scene.updateMatrixWorld(true)

  const collected = new Map<string, Collected>()
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    // Skips Pyraminx_Base_0, which is not part of the puzzle.
    const id = PIECE_ID.exec(mesh.name)?.[1]
    if (!id) return

    let entry = collected.get(id)
    if (!entry) {
      entry = { geometries: [], colors: new Set() }
      collected.set(id, entry)
    }

    const letter = STICKER.exec(mesh.name)?.[1]
    if (letter) entry.colors.add(letter)
    entry.geometries.push(prepare(mesh, letter ? (STICKER_RAMP[letter] ?? BODY_COLOUR) : BODY_COLOUR))
  })

  const root = new THREE.Group()
  root.name = 'PyraminxRoot'

  const merged: { id: string; colors: string; geometry: THREE.BufferGeometry }[] = []
  for (const [id, entry] of collected) {
    const geometry = mergeGeometries(entry.geometries, false)
    entry.geometries.forEach((g) => g.dispose())
    if (!geometry) continue
    merged.push({ id, colors: [...entry.colors].sort().join(''), geometry })
  }

  // Vertex centroid of the whole puzzle, then shift every geometry onto it.
  const centroid = new THREE.Vector3()
  let vertexCount = 0
  for (const { geometry } of merged) {
    const position = geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) {
      centroid.x += position.getX(i)
      centroid.y += position.getY(i)
      centroid.z += position.getZ(i)
      vertexCount++
    }
  }
  if (vertexCount > 0) centroid.divideScalar(vertexCount)

  const offset = new THREE.Matrix4().makeTranslation(-centroid.x, -centroid.y, -centroid.z)

  const pieces: Piece[] = []
  let radius = 0
  for (const { id, colors, geometry } of merged) {
    geometry.applyMatrix4(offset)
    geometry.computeBoundingSphere()

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = id
    mesh.matrixAutoUpdate = true

    const centroidLocal = new THREE.Vector3()
    const position = geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) {
      centroidLocal.x += position.getX(i)
      centroidLocal.y += position.getY(i)
      centroidLocal.z += position.getZ(i)
    }
    centroidLocal.divideScalar(position.count)
    radius = Math.max(radius, centroidLocal.length())

    root.add(mesh)
    pieces.push({ id, colors, role: 'edge', object: mesh, centroidLocal })
  }

  assignRoles(pieces)
  return { root, pieces, radius }
}

/**
 * Two sticker colours means an edge. Three means a tip or the axial beneath it;
 * within each colour triple the piece further from the centre is the tip.
 */
function assignRoles(pieces: Piece[]): void {
  const triples = new Map<string, Piece[]>()
  for (const piece of pieces) {
    if (piece.colors.length === 2) {
      piece.role = 'edge'
      continue
    }
    const group = triples.get(piece.colors) ?? []
    group.push(piece)
    triples.set(piece.colors, group)
  }

  for (const group of triples.values()) {
    group.sort((a, b) => b.centroidLocal.length() - a.centroidLocal.length())
    group.forEach((piece, index) => {
      piece.role = index === 0 ? 'tip' : 'axial'
    })
  }
}

/** Current centroid of a piece, in the puzzle root's space. */
export function currentCentroid(piece: Piece, target = new THREE.Vector3()): THREE.Vector3 {
  return target.copy(piece.centroidLocal).applyMatrix4(piece.object.matrix)
}
