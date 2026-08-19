// lib/pyraminx/sweepMaterial.ts
// One material for the whole puzzle: the face luminance ramp rides in vertex
// colours (which is what lets each piece merge to a single geometry), and thin
// light lines travel across the surfaces in world space.
import * as THREE from 'three'

export interface SweepUniforms {
  uTime: { value: number }
  uFrequency: { value: number }
  uSpeed: { value: number }
  uWidth: { value: number }
  uSoftness: { value: number }
  uIntensity: { value: number }
  uColour: { value: THREE.Color }
}

export interface SweepMaterial extends THREE.MeshStandardMaterial {
  sweep: SweepUniforms
}

/**
 * Bands repeat every 1/uFrequency world units along +Y and travel at
 * uSpeed cycles per second. Defaults put roughly three lines across the
 * model's height, each crossing it in about six seconds.
 */
export function createSweepMaterial(): SweepMaterial {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.4,
  }) as SweepMaterial

  const sweep: SweepUniforms = {
    uTime: { value: 0 },
    uFrequency: { value: 0.7 },
    uSpeed: { value: 0.5 },
    uWidth: { value: 0.03 },
    uSoftness: { value: 0.02 },
    uIntensity: { value: 0.35 },
    uColour: { value: new THREE.Color(0xf5f5f7) },
  }
  material.sweep = sweep

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sweep)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSweepWorld;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvSweepWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vSweepWorld;
uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;
uniform float uWidth;
uniform float uSoftness;
uniform float uIntensity;
uniform vec3 uColour;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  float phase = fract(vSweepWorld.y * uFrequency - uTime * uSpeed);
  float band = smoothstep(0.0, uSoftness, phase)
             * (1.0 - smoothstep(uWidth, uWidth + uSoftness, phase));
  totalEmissiveRadiance += band * uIntensity * uColour;
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
