# Design: Site-wide UI & Motion System

**Date:** 2026-08-18
**Status:** Approved (design), pending implementation plan
**Scope:** melihtakyaci.com portfolio — Next.js 15, Tailwind v4, framer-motion, React Three Fiber

---

## 1. Goal

Raise the site's UI to a top-tier bar: a single, coherent motion + typography +
surface system that reads as restrained and precise (Apple) with an editorial,
gridded information rhythm (Google DeepMind). Simplicity is a constraint, not a
casualty — motion must be systematic, never decorative noise.

### Success criteria

1. Every animation on the site draws its easing, duration, distance, and stagger
   from one shared token source. No component defines its own timing.
2. Every section's entrance is produced by a shared primitive, not bespoke code.
3. `prefers-reduced-motion: reduce` collapses all transform motion site-wide.
4. Only `transform` and `opacity` are animated; no layout-triggering properties.
5. `npm run build` and `npm run lint` pass clean.
6. Manual review at 390 / 768 / 1440 px, and with reduced-motion enabled.

### Non-goals

- Pinned sections, scroll-scrubbed 3D camera paths, cross-section morph
  transitions ("cinematic" tier) — deliberately deferred.
- Light theme / theme toggle.
- Content rewrites beyond the hero sentence and skill-card labels.
- Touching SEO metadata, JSON-LD, sitemap, or `app/api/info/route.ts`.

---

## 2. Decisions taken

| Question | Decision |
|---|---|
| Scope | Structure is flexible — sections may be recomposed, not just restyled |
| Palette | Dark monochrome + a single accent, used only for state |
| Hero | Full-bleed 3D scene with typography beneath; scene shrinks to a corner on scroll |
| Motion ambition | Systematic + scroll-linked staging (not cinematic) |
| Technical approach | Motion tokens + framer-motion primitives (A) |

**Approach A was chosen over:**
- **B (CSS-first `animation-timeline: view()`):** browser baseline is uneven,
  Safari support not verified. Would require a JS fallback anyway, i.e. two
  systems to maintain.
- **C (GSAP + ScrollTrigger):** a new dependency whose advantage is scrubbing and
  pinning — precisely the tier that is out of scope. framer-motion is already a
  dependency and covers the chosen tier.

---

## 3. Foundation layer — design tokens

Rewrite `app/globals.css` as a token layer using Tailwind v4 `@theme`.

### Color

| Token | Value | Use |
|---|---|---|
| `--ink-0` | `#08090A` | Page ground |
| `--ink-1` | `#0D0E10` | Surface (cards, header pill) |
| `--ink-2` | `#141517` | Raised surface (hover state) |
| `--line` | `rgba(255,255,255,0.08)` | Hairline borders and rules |
| `--fg-1` | `#F5F5F7` | Primary text |
| `--fg-2` | `#A1A1A6` | Secondary text |
| `--fg-3` | `#6E6E73` | Tertiary text, metadata |
| `--accent` | `#5B8CFF` | Focus rings, links, active state **only** |

The accent is never decorative. If a colored element is not communicating state,
it is neutral.

### Typography

Fluid 6-step `clamp()` scale. Tracking tightens as size grows
(`-0.02em` at display sizes down to `0` at body). Geist Sans for text, Geist Mono
for metadata and section labels — both already loaded in `app/layout.tsx`.

### Surface

One recipe, used everywhere a panel is needed:
`background: --ink-1 / 70%` + `1px --line` border + `backdrop-blur-xl`.
Radius scale: `12px` (small) / `18px` (card) / `28px` (large panel).

### Pre-existing defects fixed as part of this work

1. **`app/globals.css` — the site renders in Arial.** `body { font-family: Arial,
   Helvetica, sans-serif }` overrides the loaded Geist font; `body` carries the
   `--font-geist-sans` variable but no `font-sans` class. Fix: drop the Arial
   rule, apply `font-sans` on `body` in `app/layout.tsx`.
2. **`components/Header.tsx:39` — `h-[${HEADER_H}px]`** is an interpolated
   Tailwind class, which the compiler cannot see; the header height never
   applies. Fix: static class or inline style. Resolved by the header rewrite.
3. **`app/globals.css` — dead rules.** `.navBar`, `.shine-effect`, and
   `.shine-parent` are defined but referenced nowhere. Not carried into the
   rewritten file.
4. **`app/page.tsx:46` — `perspective-1000`** is not a Tailwind utility and is a
   no-op. Removed along with the emoji flip element it decorates.

---

## 4. Motion language

### `lib/motion.ts` — the single source

```ts
export const ease = {
  enter: [0.16, 1, 0.3, 1],   // decelerating; the Apple signature
  exit:  [0.7, 0, 0.84, 0],
}
export const spring = { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }
export const duration = { xs: 0.16, sm: 0.24, md: 0.4, lg: 0.64, xl: 0.9 }
export const distance = { sm: 8, md: 16, lg: 32 }
export const stagger = 0.06
```

No component may hardcode a timing value. Every animation composes from these.

### `components/motion/` — five primitives

| Primitive | Responsibility | Interface |
|---|---|---|
| `Reveal` | Viewport-entry fade + rise, fires once | `children`, `delay?`, `distance?` |
| `Stagger` | Sequences its children by `stagger` | `children`, `delay?` |
| `TextReveal` | Drives a heading up line-by-line from behind a mask | `text`, `as?`, `delay?` |
| `Magnetic` | Element translates toward the cursor (max 6px), springs back | `children`, `strength?` |

**`ScrollScene` was dropped during planning.** It was specified as a fifth
primitive, but the hero's corner-parking transform is its only consumer, and a
single-use abstraction is worse than the inline code it hides. The `useScroll` +
`useSpring` mapping lives directly in `components/Hero.tsx`. Extract it if a
second scroll-linked scene ever appears.

`Stagger` and `Reveal` are deliberately not composable: framer-motion stops
propagating variants to a child that declares its own `initial`/`whileInView`, so
staggered lists use the `Stagger` + `StaggerItem` pair and standalone blocks use
`Reveal`.

Each primitive reads `usePrefersReducedMotion` internally. This is the only place
reduced-motion is handled; consumers never check it.

Ad-hoc animation code being retired into these primitives:
- `Carousel.tsx` — its private `useIsInViewport`, `usePrefersReducedMotion`, and
  hand-computed `transitionDelay` ladders.
- `ExperienceCards.tsx` — local `cardVariants`.
- `ContactSection.tsx`, `GitHubCTA.tsx` — inline `initial`/`whileInView` timings.

`usePrefersReducedMotion` is lifted out of `Carousel.tsx` into a shared hook.

---

## 5. Page composition

### Hero
Full-viewport-height quiet 3D scene. As scroll advances through the hero,
`ScrollScene` maps progress to `scale 1 → 0.32` plus a translate that parks the
pyraminx in the top-right corner, where it stays as a persistent motif. Content
takes over the foreground.

Headline copy, revealed line-by-line via `TextReveal`:

> **Melih Takyaci**
> Full-stack engineer building systems from silicon to screen.

The `Typewriter` and the ✌️→🫶 emoji flip are removed; `react-simple-typewriter`
is dropped from `package.json`.

### Header
Transparent and full-width at the top; on scroll it condenses into a floating,
centered pill (rounded-full, blurred, hairline border) using framer-motion
`layout` so the transition is continuous rather than a class swap. The existing
`window.scrollTo(0,1) / scrollTo(0,0)` mount hack is removed.

### Skills (`Carousel.tsx`)
Emoji grid becomes an editorial numbered list — `01 — Full-Stack Web Developer` —
with mono numerals, hairline dividers, and a surface lift on hover. This is the
DeepMind signature in the layout. Entrances come from `Stagger` + `Reveal`.

### Experience (`ExperienceCards.tsx`)
The per-card saturated gradients (purple / lime / pink / cyan) contradict the
monochrome direction and are removed; cards sit on the neutral surface recipe and
color enters only through the project screenshots. Hover: image `scale 1.04` plus
a small cursor-tracked parallax, both transform-only.

### GitHub CTA
`whileHover={{ scale: 1.2 }}` is disproportionate for this vocabulary; replaced
by `Magnetic`.

### Contact
The memoji swap stays — it is the human note. Surrounding typography calms down,
and the 📧 / 💼 / 💻 lines become a hairline-ruled list with mono labels.

### Background (`BackgroundFX.tsx`)
The three-color aurora (blue / pink / green radial gradients) is replaced by a
single very low-opacity neutral glow that tracks the accent hue, keeping the
grain and vignette. The background stops competing with content for attention.

### Section headers
Shared `SectionHeader` component: `02 / EXPERIENCE` in mono uppercase over a
hairline rule. Applied to every section for a consistent editorial rhythm.

---

## 6. 3D scene

The pyraminx model and materials are unchanged. Added:

- Entrance: `scale 0.85 → 1` with a settling rotation, on the shared `ease.enter`.
- Damped idle auto-rotation, plus a slight tilt toward the pointer.
- **Performance:** the canvas switches to `frameloop='never'` when the scene
  leaves the viewport (IntersectionObserver) and back to `'always'` when it
  returns. Today it renders continuously for the whole session.

---

## 7. Accessibility & performance

- One `usePrefersReducedMotion` hook, consumed by every primitive; under reduce,
  transforms collapse to opacity-only. Currently only `Carousel` honors it.
- Animated properties restricted to `transform` and `opacity`.
- Pointer-parallax and heavy `backdrop-blur` disabled below the `md` breakpoint.
- Focus states use `--accent` with a visible ring; existing 44px touch targets in
  the header are preserved.

---

## 8. Files touched

**New**
- `lib/motion.ts`
- `lib/usePrefersReducedMotion.ts`
- `components/motion/Reveal.tsx`, `Stagger.tsx` (exports `Stagger` + `StaggerItem`), `TextReveal.tsx`, `Magnetic.tsx`
- `components/SectionHeader.tsx`
- `components/Hero.tsx` (hero extracted out of `app/page.tsx`, which becomes pure composition)

**Modified**
- `app/globals.css` (rewritten as the token layer)
- `app/layout.tsx` (`font-sans` on `body` — nothing else; metadata and JSON-LD untouched)
- `app/page.tsx` (composition)
- `components/Header.tsx`, `Carousel.tsx`, `ExperienceCards.tsx`, `GitHubCTA.tsx`, `ContactSection.tsx`, `BackgroundFX.tsx`
- `components/PyraminxCanvas.tsx` (entrance + viewport-gated frameloop)
- `components/index.ts` (exports)
- `package.json` (remove `react-simple-typewriter`)

**Untouched**
- `app/api/info/route.ts`, `next-sitemap.config.js`, `public/*`, all SEO metadata
- `components/PyraminxModel.tsx`, `components/ForceBoundsRefit.tsx`

---

## 9. Verification

| Check | Command / method |
|---|---|
| Build | `npm run build` — clean |
| Lint | `npm run lint` — clean |
| Responsive | Manual pass at 390 / 768 / 1440 px |
| Reduced motion | OS reduce-motion on: no transform motion anywhere |
| Token discipline | `grep` for hardcoded `duration:` / `ease` / `transitionDelay` in `components/` returns only `lib/motion.ts` consumers |
| 3D perf | Scene stops rendering when scrolled out of view |
