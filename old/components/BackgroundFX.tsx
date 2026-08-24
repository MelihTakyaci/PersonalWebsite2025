'use client'
import { memo } from 'react'

/** 
 * Aurora + Grain + Vignette – tamamen CSS tabanlı, ekstra dosya yok.
 * pointer-events-none: tıklamaları engellemez.
 */
function BackgroundFX() {
  // Base64 SVG noise (çok hafif)
  const NOISE =
    "url(\"data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/></filter>\
<rect width='100%' height='100%' filter='url(%23n)' opacity='0.06'/>\
</svg>\")"

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 1) Ana degrade */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />

      {/* 2) Aurora (çok düşük opaklıkta iki büyük radial gradient) */}
      <div className="
        absolute inset-0 opacity-60
        bg-[radial-gradient(1200px_600px_at_8%_-10%,rgba(120,120,255,0.18),transparent_60%),
            radial-gradient(900px_500px_at_92%_6%,rgba(255,120,200,0.16),transparent_65%),
            radial-gradient(700px_400px_at_40%_110%,rgba(120,255,200,0.10),transparent_60%)]
      " />

      {/* 3) Vignette (üst tarafı daha koyu) */}
      <div className="
        absolute inset-0
        [mask-image:radial-gradient(60%_40%_at_50%_20%,black_30%,transparent_100%)]
        bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),transparent_35%)]
        mix-blend-multiply
      " />

      {/* 4) Noise (grain) */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '140px 140px' }}
      />
    </div>
  )
}

export default memo(BackgroundFX)