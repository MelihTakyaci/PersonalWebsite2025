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
  /** Gaussian half-width, in cycles. Larger is softer and wider. */
  uWidth: { value: number }
  uIntensity: { value: number }
  uColour: { value: THREE.Color }
  /** Direction the bands travel, world space. */
  uDirection: { value: THREE.Vector3 }
}

export interface SweepMaterial extends THREE.MeshStandardMaterial {
  sweep: SweepUniforms
}

/**
 * The bands are shaped like light rather than paint: a Gaussian profile instead
 * of a hard-edged bar, scaled by how much a face turns toward the travel
 * direction and by a Fresnel term so grazing angles catch them the way a real
 * highlight does. Without those two factors the sweep reads as a stripe drawn
 * on the surface, because it ignores both the geometry and the viewer.
 */
export function createSweepMaterial(): SweepMaterial {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.4,
  }) as SweepMaterial

  const sweep: SweepUniforms = {
    uTime: { value: 0 },
    uFrequency: { value: 0.6 },
    uSpeed: { value: 1.6 },
    uWidth: { value: 0.09 },
    uIntensity: { value: 0.55 },
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
uniform float uWidth;
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
  float phase = fract(dot(vSweepWorld, uDirection) * uFrequency - uTime * uSpeed);
  float offset = min(phase, 1.0 - phase);
  float band = exp(-(offset * offset) / (uWidth * uWidth));

  float facing = clamp(dot(vSweepNormal, uDirection) * 0.5 + 0.5, 0.0, 1.0);
  float fresnel = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.5);

  float light = band * mix(0.3, 1.0, facing) * (0.25 + 0.75 * fresnel);
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
