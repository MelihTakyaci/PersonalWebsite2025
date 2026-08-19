// lib/pyraminx/glitch.ts
// Shared signal-tear effect. Injected into both puzzle materials so the body
// and its wireframe come apart together — glitching only the surface would
// leave the edges hanging in the air.

export interface GlitchUniforms {
  /** Shared clock, also drives the light sweep. */
  uTime: { value: number }
  /** 0 = fully present, 1 = fully gone. */
  uGlitch: { value: number }
  /** 0 disables the tear and the colour fringe, leaving a plain dissolve. */
  uJitter: { value: number }
  /** Horizontal bands per view-space unit. */
  uSlices: { value: number }
}

export function createGlitchUniforms(): GlitchUniforms {
  return {
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uJitter: { value: 1 },
    uSlices: { value: 9 },
  }
}

const DECLARATIONS = `
varying float vGlitchSlice;
uniform float uTime;
uniform float uGlitch;
uniform float uJitter;
uniform float uSlices;
float glitchHash(float n) { return fract(sin(n) * 43758.5453123); }
`

/**
 * The tear is applied in view space, after <project_vertex>, so the bands stay
 * horizontal on screen while the model turns underneath them. The dissolve uses
 * a different hash from the tear, so the slices that shift are not the same
 * ones that vanish.
 */
export function injectGlitch(
  shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, unknown> },
  uniforms: GlitchUniforms
): void {
  Object.assign(shader.uniforms, uniforms)

  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>${DECLARATIONS}`)
    .replace(
      '#include <project_vertex>',
      `#include <project_vertex>
{
  vGlitchSlice = floor(mvPosition.y * uSlices);
  float seed = vGlitchSlice * 12.9898 + floor(uTime * 18.0) * 7.13;
  mvPosition.x += (glitchHash(seed) * 2.0 - 1.0) * uGlitch * uJitter * 0.9;
  gl_Position = projectionMatrix * mvPosition;
}`
    )

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>${DECLARATIONS}`)
    .replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
{
  float seed = vGlitchSlice * 78.233 + floor(uTime * 18.0) * 3.71;
  if (glitchHash(seed) < uGlitch) discard;
}`
    )
}
