'use client'
import { memo } from 'react'

/**
 * Page ground: one low-opacity cool glow behind the hero, plus grain
 * and a bottom vignette. Fixed, so it covers the full scroll height.
 */
function BackgroundFX() {
  const NOISE =
    "url(\"data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/></filter>\
<rect width='100%' height='100%' filter='url(%23n)' opacity='0.06'/>\
</svg>\")"

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Ground */}
      <div className="absolute inset-0 bg-ink-0" />

      {/* One glow, tinted toward the accent, at the top of the page. */}
      <div
        className="absolute inset-0
          bg-[radial-gradient(1100px_620px_at_50%_-15%,rgba(91,140,255,0.10),transparent_62%)]"
      />

      {/* Vignette toward the bottom. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgba(0,0,0,0.55))]" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: NOISE,
          backgroundRepeat: 'repeat',
          backgroundSize: '140px 140px',
        }}
      />
    </div>
  )
}

export default memo(BackgroundFX)
