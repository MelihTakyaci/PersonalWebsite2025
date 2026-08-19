// scripts/verify-pyraminx.mjs
// Offline correctness check for the pyraminx turning engine.
//
// Imports the same TypeScript modules the browser component uses (via Node's
// type stripping), so this exercises the real engine rather than a copy.
//
//   node scripts/verify-pyraminx.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { buildPuzzle, currentCentroid } from '../lib/pyraminx/pieces.ts'
import { AXES, AXIS_NAMES, applyMove, layerMembers, scramble, solutionFor } from '../lib/pyraminx/moves.ts'

const EPS = 1e-6
const failures = []
let total = 0

function check(name, ok, detail = '') {
  total++
  const mark = ok ? '  ok  ' : ' FAIL '
  console.log(`[${mark}] ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures.push(name)
}

/** Deterministic RNG so a failure can be reproduced from its seed. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function loadScene(path) {
  const buf = readFileSync(path)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  return new Promise((resolve, reject) =>
    new GLTFLoader().parse(ab, '', (gltf) => resolve(gltf.scene), reject)
  )
}

function snapshot(puzzle) {
  return puzzle.pieces.map((p) => p.object.matrix.clone())
}

function restore(puzzle, matrices) {
  puzzle.pieces.forEach((piece, i) => {
    matrices[i].decompose(piece.object.position, piece.object.quaternion, piece.object.scale)
    piece.object.updateMatrix()
  })
}

function maxMatrixDelta(a, b) {
  let worst = 0
  for (let i = 0; i < 16; i++) worst = Math.max(worst, Math.abs(a.elements[i] - b.elements[i]))
  return worst
}

const scene = await loadScene(fileURLToPath(new URL('../public/black.glb', import.meta.url)))
const puzzle = buildPuzzle(scene, new THREE.MeshStandardMaterial())
puzzle.root.updateMatrixWorld(true)

// 1 — piece census
const roles = { tip: 0, axial: 0, edge: 0 }
for (const piece of puzzle.pieces) roles[piece.role]++
check(
  '1. Parça sayımı: 14 parça = 4 uç + 4 eksen + 6 kenar',
  puzzle.pieces.length === 14 && roles.tip === 4 && roles.axial === 4 && roles.edge === 6,
  `toplam=${puzzle.pieces.length} uç=${roles.tip} eksen=${roles.axial} kenar=${roles.edge}`
)

// 2 — measured axes agree with the analytic tetrahedron
const tips = puzzle.pieces.filter((p) => p.role === 'tip')
let worstAngle = 0
for (const name of AXIS_NAMES) {
  const axis = AXES[name]
  let best = Infinity
  for (const tip of tips) {
    best = Math.min(best, tip.centroidLocal.clone().normalize().angleTo(axis))
  }
  worstAngle = Math.max(worstAngle, (best * 180) / Math.PI)
}
check('2. Eksen sadakati: ölçülen eksenler analitik değerlere 2° içinde', worstAngle < 2, `en kötü sapma ${worstAngle.toFixed(3)}°`)

// 3 — layer sizes
let layersOk = true
const sizes = []
for (const name of AXIS_NAMES) {
  const axial = layerMembers(puzzle, name, 'axial')
  const tip = layerMembers(puzzle, name, 'tip')
  sizes.push(`${name}:${axial.length}/${tip.length}`)
  if (axial.length !== 5 || tip.length !== 1) layersOk = false
}
check('3. Katman boyutları: her eksen katmanı 5, her uç katmanı 1 parça', layersOk, sizes.join(' '))

// 4 — round trip: a scramble followed by its inverse restores every piece
const solved = snapshot(puzzle)
let worstRoundTrip = 0
let roundTripFailSeed = null
for (let seed = 1; seed <= 200; seed++) {
  restore(puzzle, solved)
  const random = rng(seed)
  const sequence = scramble(8, random)
  for (const move of sequence) applyMove(puzzle, move)
  for (const move of solutionFor(sequence)) applyMove(puzzle, move)
  let worst = 0
  puzzle.pieces.forEach((piece, i) => {
    worst = Math.max(worst, maxMatrixDelta(piece.object.matrix, solved[i]))
  })
  if (worst > worstRoundTrip) {
    worstRoundTrip = worst
    if (worst > EPS && roundTripFailSeed === null) roundTripFailSeed = seed
  }
}
check(
  '4. Gidiş-dönüş: 200 dizi, karıştır + tersini oyna = başlangıç',
  worstRoundTrip <= EPS,
  `en kötü sapma ${worstRoundTrip.toExponential(2)}${roundTripFailSeed ? ` (seed ${roundTripFailSeed})` : ''}`
)

// 5 — order-3 closure: the same turn three times must be the identity.
//     This is the real test that an axis is a true symmetry axis; a fraction of
//     a degree of error would show up here long before the eye caught it.
restore(puzzle, solved)
let worstClosure = 0
for (const name of AXIS_NAMES) {
  for (const layer of ['axial', 'tip']) {
    for (const turns of [1, -1]) {
      restore(puzzle, solved)
      for (let i = 0; i < 3; i++) applyMove(puzzle, { axis: name, layer, turns })
      puzzle.pieces.forEach((piece, i) => {
        worstClosure = Math.max(worstClosure, maxMatrixDelta(piece.object.matrix, solved[i]))
      })
    }
  }
}
check(
  '5. Kapanma: aynı hamle 3 kez = birim dönüş (16 kombinasyon)',
  worstClosure <= EPS,
  `en kötü sapma ${worstClosure.toExponential(2)}`
)

// 6 — no accumulation over a run far longer than any the loop will play
restore(puzzle, solved)
const longRun = scramble(500, rng(99))
for (const move of longRun) applyMove(puzzle, move)
for (const move of solutionFor(longRun)) applyMove(puzzle, move)
let worstDrift = 0
puzzle.pieces.forEach((piece, i) => {
  worstDrift = Math.max(worstDrift, maxMatrixDelta(piece.object.matrix, solved[i]))
})
check('6. Birikme yok: 500 hamle + tersi = başlangıç', worstDrift <= EPS, `en kötü sapma ${worstDrift.toExponential(2)}`)

// Informational: the asset's pieces are not congruent, so a scrambled pose
// carries a little modelling variation. Not an engine property — reported so a
// visible seam is not mistaken for drift.
restore(puzzle, solved)
const spread = {}
for (const role of ['tip', 'axial', 'edge']) {
  const ds = puzzle.pieces.filter((p) => p.role === role).map((p) => p.centroidLocal.length())
  spread[role] = (Math.max(...ds) - Math.min(...ds)).toExponential(2)
}
console.log('')
console.log(`  bilgi: parçalar birebir eş değil — merkez uzaklığı yayılımı uç=${spread.tip} eksen=${spread.axial} kenar=${spread.edge}`)
console.log('         (modelin kendi özelliği; karışık hâlde <%0.4 hizasızlık demek)')

console.log('')
if (failures.length) {
  console.log(`${failures.length}/${total} kontrol BAŞARISIZ`)
  process.exit(1)
}
console.log(`${total}/${total} kontrol geçti`)
