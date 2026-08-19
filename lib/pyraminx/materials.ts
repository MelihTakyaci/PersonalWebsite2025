// lib/pyraminx/materials.ts
// The puzzle's two materials and the uniform set they share: a surface material
// carrying the luminance ramp and the light sweep, and a line material for the
// edge overlay. Both take the same signal-tear injection, and both read one
// clock, so a single update per frame drives everything.
import * as THREE from 'three'
import { createGlitchUniforms, injectGlitch, type GlitchUniforms } from './glitch.ts'

export interface SweepUniforms {
  /** Bands per world unit along the travel direction. */
  uFrequency: { value: number }
  /** Cycles per second. */
  uSpeed: { value: number }
  /** Lobe exponent. 1.0 is a pure raised cosine — the softest shape there is;
   *  higher values pull the light into a tighter, harder band. */
  uSharpness: { value: number }
  /** Peak highlight as a fraction of the surface's own albedo, not an absolute
   *  radiance — the sweep is multiplied by diffuseColor. */
  uIntensity: { value: number }
  uColour: { value: THREE.Color }
  /** Direction the bands travel, world space. */
  uDirection: { value: THREE.Vector3 }
}

export type PuzzleUniforms = GlitchUniforms & SweepUniforms

export interface PuzzleMaterials {
  surface: THREE.MeshStandardMaterial
  edge: THREE.LineBasicMaterial
  uniforms: PuzzleUniforms
}

/**
 * The sweep behaves like light rather than paint. Two raised-cosine layers at
 * unrelated rates give a field with no edge and no countable stripes; the
 * result is scaled by how much a face turns toward the travel direction, by a
 * Fresnel term so grazing angles catch it, and finally by the surface's own
 * colour — a flat white emissive on a near-black material peaks well above the
 * albedo and washes every face out.
 */
export function createPuzzleMaterials(): PuzzleMaterials {
  const uniforms: PuzzleUniforms = {
    ...createGlitchUniforms(),
    uFrequency: { value: 0.28 },
    uSpeed: { value: 1.1 },
    uSharpness: { value: 1.0 },
    uIntensity: { value: 0.55 },
    uColour: { value: new THREE.Color(0xf5f5f7) },
    uDirection: { value: new THREE.Vector3(0, 1, 0) },
  }

  const surface = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.4,
  })

  surface.onBeforeCompile = (shader) => {
    // injectGlitch binds the whole uniform set, sweep values included.
    injectGlitch(shader, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vSweepWorld;\nvarying vec3 vSweepNormal;'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vSweepWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
vSweepNormal = normalize(mat3(modelMatrix) * objectNormal);`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vSweepWorld;
varying vec3 vSweepNormal;
uniform float uFrequency;
uniform float uSpeed;
uniform float uSharpness;
uniform float uIntensity;
uniform vec3 uColour;
uniform vec3 uDirection;`
      )
      // Sits after <normal_fragment_begin>, so `normal` and `vViewPosition` are
      // both in scope here.
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  float phase = dot(vSweepWorld, uDirection) * uFrequency - uTime * uSpeed;
  float lobe  = pow(0.5 + 0.5 * cos(6.28318530718 * phase), uSharpness);
  float under = pow(0.5 + 0.5 * cos(6.28318530718 * (phase * 0.45 + 0.37)), uSharpness);
  float band  = 0.6 * lobe + 0.4 * under;

  float facing = clamp(dot(vSweepNormal, uDirection) * 0.5 + 0.5, 0.0, 1.0);
  float fresnel = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 1.8);

  float light = band * mix(0.55, 1.0, facing) * (0.6 + 0.4 * fresnel);

  // Reflect off the surface rather than replacing it. Adding a flat white
  // emissive to a near-black material swamps it: at an absolute setting the
  // band peaked at 2.2x the brightest face's albedo and 13x the darkest, which
  // washed every face out and flattened the luminance ramp along with it.
  // Scaling by diffuseColor makes each face lift in proportion to what it
  // already is, the way a real highlight does.
  vec3 reflected = diffuseColor.rgb + vec3(0.004);
  totalEmissiveRadiance += light * uIntensity * uColour * reflected;

  // Colour fringe, strongest halfway through the tear and gone at both ends.
  float fringeAmount = uGlitch * (1.0 - uGlitch) * 4.0 * uJitter;
  vec3 fringe = vec3(
    glitchHash(vGlitchSlice * 3.1),
    glitchHash(vGlitchSlice * 5.7),
    glitchHash(vGlitchSlice * 9.3)
  );
  totalEmissiveRadiance += fringe * fringeAmount * 1.6 * reflected;
}`
      )
  }

  const edge = new THREE.LineBasicMaterial({ color: 0x9aa0a8, opacity: 0.75, transparent: true })
  edge.onBeforeCompile = (shader) => injectGlitch(shader, uniforms)

  return { surface, edge, uniforms }
}
