# Design: Pyraminx Solve Animation

**Date:** 2026-08-19
**Status:** Approved (design), pending implementation plan
**Scope:** melihtakyaci.com hero 3D scene — React Three Fiber, three 0.176

---

## 1. Goal

Replace the hero's idly rotating pyraminx with a puzzle that continuously
scrambles and solves itself, differentiated by light rather than colour, with
crisp line-shaped light sweeps travelling across its surfaces.

### Success criteria

1. A full scramble → solve cycle runs on loop without the pieces drifting: after
   any number of cycles every piece returns to its exact start transform.
2. Every turn is a legal pyraminx move — a layer rotates as a rigid body about a
   real vertex axis, and faces stay flush throughout.
3. The palette stays monochrome. Faces are separated by a narrow luminance ramp,
   not by hue.
4. `prefers-reduced-motion: reduce` leaves the puzzle solved and still.
5. The scene still stops rendering when scrolled out of view.
6. `npm run build`, `npx tsc --noEmit`, and `npm run lint` stay clean.

### Non-goals

- A pyraminx **solver**. The solve is the scramble played backwards (§6), so no
  search algorithm is needed.
- User interaction — no dragging layers. `OrbitControls` camera orbit stays as
  it is today.
- Blender. The asset is already segmented (§3); nothing needs remodelling.
- Scroll-linked solving. The loop runs on its own clock.

---

## 2. Decisions taken

| Question | Decision |
|---|---|
| Where the animation is produced | Runtime move engine in three.js, not baked keyframes |
| Behaviour | Continuous loop: scramble → solve → repeat |
| Face differentiation | Lighting, plus a **narrow** luminance ramp so "solved" is readable |
| Signature effect | Line-shaped light sweeps travelling across the surfaces |
| Sweep technique | Shader injection on `MeshStandardMaterial` via `onBeforeCompile` |

**On the luminance ramp:** a pyraminx is a flush tetrahedron whether solved or
scrambled — only the sticker colours reveal the state. With identical materials
on every face the loop would read as "pieces rotating", never as "solved". A
narrow ramp inside the existing grey scale keeps the monochrome direction while
making the resolution legible. This was raised and accepted.

**Blender was evaluated and dropped.** The job it was wanted for — cutting the
model into pieces — is already done in the shipped asset.

---

## 3. The asset

Switch the hero from `public/blackO.glb` (5 merged meshes) to
`public/black.glb` (51 meshes, same 5.261 x 4.334 x 4.580 bounds, 549 KB).

`black.glb` carries the puzzle already segmented, named by piece:

- `PieceNNN_Base_0` — the piece body
- `PieceNNN_Sticker_<C>-P_0` — one face plate, `<C>` in `B G R Y`
- `Pyraminx_Base_0` — a stray mesh that is **not** part of the puzzle; excluded.

Fourteen pieces, classified by how many distinct sticker colours they carry and
how far their centroid sits from the puzzle centre:

| Role | Count | Identification | Pieces |
|---|---|---|---|
| Edge | 6 | 2 colours | 005, 008, 010, 012, 013, 014 |
| Tip | 4 | 3 colours, outer of its colour triple | 001 (BGY), 002 (BGR), 003 (GRY), 004 (BRY) |
| Axial | 4 | 3 colours, inner of its colour triple | 009 (BGY), 011 (BGR), 007 (GRY), 006 (BRY) |

Roles are derived at load time from the names and centroids, not hardcoded, so
a re-export with different numbering still works.

### Centre

The puzzle centre is the **vertex centroid** — the mean of every vertex —
measured at `(-0.0015, 0.0317, -0.0041)`, i.e. the origin.

Do not use the bounding-box centre. For a tetrahedron it sits far off the
centroid — `(0.0000, 1.0491, 0.7459)` for this asset — and pivoting there swings
the model through an arc of that radius. This mistake was made and reverted
during the preceding work; the comment in `PyraminxModel.tsx` records it.

---

## 4. Axes and layers

The four turning axes are the directions from the centre to the four vertices.
Use **exact analytic values** for the canonical tetrahedron with its apex on
`+Y`, not the measured directions:

| Axis | Vertex piece | Unit vector |
|---|---|---|
| `U` | 001 (BGY) | `(0, 1, 0)` |
| `F` | 002 (BGR) | `(0, -1/3, 2√2/3)` |
| `R` | 003 (GRY) | `(√6/3, -1/3, -√2/3)` |
| `L` | 004 (BRY) | `(-√6/3, -1/3, -√2/3)` |

The asset's measured directions agree with these to within **0.638°** (mean
0.555°), so the analytic set is a faithful description of the model. Using it
rather than the measurement matters: every turn is exactly 120° about a fixed
axis, and only an exact symmetry axis maps a layer onto itself. A 0.6° error
would leave pieces slightly proud after each turn and accumulate over a loop
that never ends.

At load, assert each measured axis is within 2° of its analytic counterpart. A
larger deviation means the asset is not the puzzle this engine assumes, and the
component falls back to the current idle rotation rather than animating garbage.

### Layer membership

For axis `a`, project each piece's centroid onto `a`. The measured spread for
`U` is representative and cleanly separated:

```
tip   001   2.317
axial 009   0.887
edge  012   0.864
edge  005   0.821
edge  008   0.821
--------------------  cut at 0.30
everything else  <= -0.571
```

- **Tip layer** (`u`, `f`, `r`, `l`): projection > `1.50` — the tip alone.
- **Axial layer** (`U`, `F`, `R`, `L`): projection > `0.30` — tip + axial + 3 edges.

Both thresholds sit in gaps wider than 0.6 units, so they are not delicate.

Membership is re-derived from the pieces' **current** centroids at the moment
each move starts. It must not be cached from the solved pose: pieces change
layers as the puzzle is scrambled, so a cached set would rotate the wrong
pieces from the second move onward.

---

## 5. Move engine

A move is `{ axis: U|F|R|L, layer: 'tip'|'axial', turns: +1|-1 }`, where `+1` is
120° clockwise looking down the axis toward the centre.

Executing a move:

1. Collect the pieces whose **current** centroid projects beyond the layer's
   threshold on that axis.
2. Reparent them to a pivot `Object3D` sitting at the puzzle centre, preserving
   world transforms (`THREE.Object3D.attach`).
3. Animate the pivot's rotation about the axis from 0 to ±120° over the move
   duration.
4. On completion, snap the pivot to exactly ±120°, reparent the pieces back to
   the root with `attach`, and reset the pivot to identity.

Step 4's snap is what keeps a never-ending loop exact: pieces inherit a
transform composed from an exact 120° rotation, so the lattice never drifts.

---

## 6. Choreography

No solver. The cycle is:

1. Generate a scramble of **14 moves**, never turning the same axis twice in a
   row so successive turns land on different corners.
2. Play the scramble.
3. Hold briefly.
4. Play the scramble **backwards with every turn inverted** — this is by
   construction a correct solve.
5. Hold on the solved state longer than the scramble hold, so the resolution
   registers.
6. Repeat with a fresh scramble.

Timing, all from `lib/motion.ts` where a token fits:

| Phase | Duration |
|---|---|
| One move | 0.24 s (`duration.sm`), eased with `ease.enter` |
| Gap between moves | 0.01 s |
| Hold after scramble | 0.16 s (`duration.xs`) |
| Hold on solved | 0.64 s (`duration.lg`) |

Holds are deliberately short. The cycle should read as one continuous working
motion rather than turns punctuated by pauses: 28 turns in about 7.8 s, of which
0.8 s is waiting.

### Resting motion

Underneath the cycle the model holds a composed pose rather than a flat spin: a
constant yaw at `0.1 rad/s`, a resting tilt of `-0.22 rad` so it is seen
slightly from above, and two slow oscillations at `0.19` and `0.13 rad/s` on `x`
and `z` that keep tipping it so different faces move through the light. A
constant yaw at a fixed elevation repeats the same silhouette forever.

The pointer tilt is damped in its own accumulator and added on top. It cannot
damp `rotation.x` directly any more, because that value now also carries the
resting tilt and the oscillation.

---

## 7. Material

### Face luminance ramp

Applied to `_Sticker_<C>-P_` meshes only, keyed by the colour letter. Piece
bodies (`_Base_`) keep the current near-black.

| Sticker | Base colour |
|---|---|
| `Y` | `#3A3C40` |
| `B` | `#2C2E32` |
| `G` | `#212327` |
| `R` | `#17181B` |

Four steps inside the dark end of the grey scale. Enough to read a solved face
as uniform; not enough to read as colour. The mapping of letter to step is
arbitrary and tunable.

Existing treatments are kept: `MeshStandardMaterial` at `metalness 0.3`,
`roughness 0.4`, and the brightened `#9aa0a8` edge lines at 0.75 opacity.

### Light sweep

`onBeforeCompile` on the shared material injects a world-space position varying
and, in the fragment stage, adds thin travelling bands to
`totalEmissiveRadiance`:

```glsl
float phase = dot(vSweepWorld, uDirection) * uFrequency - uTime * uSpeed;
float lobe  = pow(0.5 + 0.5 * cos(TAU * phase), uSharpness);
float under = pow(0.5 + 0.5 * cos(TAU * (phase * 0.45 + 0.37)), uSharpness);
float band  = 0.6 * lobe + 0.4 * under;

float facing  = clamp(dot(vSweepNormal, uDirection) * 0.5 + 0.5, 0.0, 1.0);
float fresnel = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 1.8);

totalEmissiveRadiance += band * mix(0.55, 1.0, facing)
                       * (0.6 + 0.4 * fresnel) * uIntensity * uColour;
```

The band must behave like light, not like paint. Two earlier shapes were built
and rejected on sight:

- **Hard-edged bar** (`smoothstep` between two boundaries, ignoring the normal
  and the viewer) — read as a stripe drawn on the model.
- **Gaussian band** — still has a peak and a tail, so however wide it gets it
  stays a discrete stripe. Widening it only made a wider stripe.

What works is a shape with no edge anywhere: a **raised cosine**, plus a second
layer at an unrelated rate so the result never resolves into a countable number
of lines. This is the light equivalent of blurring a hard shadow. Measured over
the model's height, the gradient the eye reads as hardness falls from
0.858 to 0.204 per unit against the first version, while contrast stays
comparable (0.26 against 0.28) — softer, not merely dimmer. The floor rises from
0.002 to 0.009, so there is no fully dark gap between passes.

`facing` scales the band by how much a face turns toward the travel direction,
which also widens the separation between the four faces. `fresnel` brightens
grazing angles, weighted 0.6/0.4 toward the broad term so the light spreads
across a face instead of collecting on its edges.

Defaults: bands travel along `+Y`, `uFrequency 0.28` (roughly one broad lobe
across the model), `uSpeed 1.1`, `uSharpness 1.0` (the softest lobe available —
raise it to tighten), `uIntensity 0.18`, colour `#F5F5F7`.
- `uTime` is advanced from the same local accumulator that drives the idle
  rotation, so it freezes with the rest under reduced motion.

**One material for everything, with the ramp carried in vertex colours.** At
load, each mesh's step from the table above is baked into a `color` attribute on
its geometry, and the single shared material sets `vertexColors: true`. This is
what makes the merge in §8 possible — a piece's body and its three stickers
differ only by attribute data, so they combine into one geometry — and it leaves
exactly one shader program and one `uTime` uniform to update per frame.

---

## 8. Integration and performance

`black.glb` has 51 meshes against `blackO.glb`'s 5, and every mesh currently
gets an `EdgesGeometry` `LineSegments` child — about 102 draw calls.

Mitigation: because every mesh shares one material (§7), each piece's body and
stickers merge at load into a **single** geometry. That leaves 14 piece meshes
plus their 14 edge overlays — about 28 draw calls, against 10 today. Higher, but
for a 14-piece articulated puzzle rather than a static shell, and an order below
the 102 the unmerged asset would cost. Merging happens once, in the existing
load effect.

Unchanged: the `frameloop='never'` gating when the scene leaves the viewport,
the entrance scale, the pointer tilt, and `OrbitControls`.

Under `prefers-reduced-motion: reduce` the component skips the cycle entirely
and renders the solved pose, static — matching how the site's other primitives
behave.

---

## 9. Files

**New**
- `lib/pyraminx/pieces.ts` — load, group by piece, classify roles, compute the
  centroid, validate axes against the analytic set
- `lib/pyraminx/moves.ts` — axis table, layer membership from current pose, move
  execution, scramble generation and inversion
- `lib/pyraminx/sweepMaterial.ts` — the material factory and its uniforms
- `scripts/verify-pyraminx.mjs` — the offline correctness check (§10)

**Modified**
- `components/PyraminxModel.tsx` — drives the engine from `useFrame`
- `components/PyraminxCanvas.tsx` — only if the lighting rig needs widening so
  the four faces separate

**Untouched**
- `public/*.glb` — no asset is re-exported
- Everything outside the 3D scene

---

## 10. Verification

The repo has no test runner, and the approved method for this work is build +
lint + typecheck + offline checks. The move engine, however, is pure geometry
and can be checked exactly, without a browser:

`scripts/verify-pyraminx.mjs` loads `black.glb` in Node, builds the same piece
groups and axis table the component uses, and asserts:

1. **Piece census** — 14 pieces: 6 edges, 4 tips, 4 axials.
2. **Axis fidelity** — every measured axis within 2° of its analytic value.
3. **Layer sizes** — each axial layer holds exactly 5 pieces, each tip layer 1.
4. **Round trip** — for 200 random sequences of 8 moves, playing the sequence
   then its inverted reverse returns every piece to its start transform within
   1e-6.
5. **No drift** — after 500 consecutive moves, every piece's position still lies
   on the lattice of the solved pose within 1e-6.

Checks 4 and 5 are the ones that make "sağlıklı" mean something: they are what
would catch an inexact axis, a bad reparent, or an accumulating float error.

| Check | Command |
|---|---|
| Engine correctness | `node scripts/verify-pyraminx.mjs` |
| Types | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Visual | Manual: loop runs, faces read, sweeps legible, reduced motion static |
