// lib/pyraminx/sweepMaterial.ts
// One material for the whole puzzle: the face luminance ramp rides in vertex
// colours (which is what lets each piece merge to a single geometry), and soft
// bands of light travel across the surfaces in world space.
import * as THREE from 'three'

export interface SweepUniforms {
  uTime: { value: number }
  /** Bands per world unit along the travel direction. */
  uFrequency: { value: number }
  /** Cycles per second. */
  uSpeed: { value: number }
  /** Lobe exponent. 1.0 is a pure raised cosine — the softest shape there is;
   *  higher values pull the light into a tighter, harder band. */
  uSharpness: { value: number }
  uIntensity: { value: number }
  uColour: { value: THREE.Color }
  /** Direction the bands travel, world space. */
  uDirection: { value: THREE.Vector3 }
}

export interface SweepMaterial extends THREE.MeshStandardMaterial {
  sweep: SweepUniforms
}

/**
 * The bands are shaped like light rather than paint. Two raised-cosine layers
 * at unrelated rates give a field with no edge and no countable stripes, and
 * the result is scaled by how much a face turns toward the travel direction and
 * by a Fresnel term so grazing angles catch it the way a real highlight does.
 * Without those last two factors the sweep reads as something drawn on the
 * surface, because it ignores both the geometry and the viewer.
 */
export function createSweepMaterial(): SweepMaterial {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.4,
  }) as SweepMaterial

  const sweep: SweepUniforms = {
    uTime: { value: 0 },
    uFrequency: { value: 0.28 },
    uSpeed: { value: 1.1 },
    uSharpness: { value: 1.0 },
    uIntensity: { value: 0.3 },
    uColour: { value: new THREE.Color(0xf5f5f7) },
    uDirection: { value: new THREE.Vector3(0, 1, 0) },
  }
  material.sweep = sweep

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sweep)

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
uniform float uTime;
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
  // A Gaussian band still has a peak and a tail, so it reads as a discrete
  // stripe however wide it gets. A raised cosine has no edge anywhere, and a
  // second layer at an unrelated rate stops the result from ever resolving into
  // a countable number of lines — the light equivalent of blurring a hard shadow.
  float phase = dot(vSweepWorld, uDirection) * uFrequency - uTime * uSpeed;
  float lobe  = pow(0.5 + 0.5 * cos(6.28318530718 * phase), uSharpness);
  float under = pow(0.5 + 0.5 * cos(6.28318530718 * (phase * 0.45 + 0.37)), uSharpness);
  float band  = 0.6 * lobe + 0.4 * under;

  float facing = clamp(dot(vSweepNormal, uDirection) * 0.5 + 0.5, 0.0, 1.0);
  float fresnel = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 1.8);

  // Weighted toward the broad term rather than the rim, so the band spreads
  // across a face instead of collecting on its edges.
  float light = band * mix(0.55, 1.0, facing) * (0.6 + 0.4 * fresnel);
  totalEmissiveRadiance += light * uIntensity * uColour;
}`
      )
  }

  return material
}

/** Edge overlay, kept from the previous look: the body stays near black, so the
 *  wireframe is what gives the object its silhouette against the dark ground. */
export function createEdgeMaterial(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({ color: 0x9aa0a8, opacity: 0.75, transparent: true })
}
