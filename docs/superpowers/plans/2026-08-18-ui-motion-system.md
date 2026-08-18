# Site-wide UI & Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's five sets of ad-hoc animations with one token-driven motion, typography, and surface system, and recompose the page around a full-bleed 3D hero that shrinks to a corner on scroll.

**Architecture:** A CSS token layer (`app/globals.css`, Tailwind v4 `@theme` + `@utility`) defines color, type, radius, and the single surface recipe. A TS token module (`lib/motion.ts`) defines every easing, duration, distance, and stagger value. Four framer-motion primitives (`Reveal`, `Stagger`/`StaggerItem`, `TextReveal`, `Magnetic`) consume those tokens and are the only place motion is authored; each reads `usePrefersReducedMotion` internally so consumers never check it. Every section component is then rewritten to be pure layout plus primitives.

**Tech Stack:** Next.js 15.3.2 (App Router), React 19, TypeScript (strict), Tailwind CSS v4.1, framer-motion 12, @react-three/fiber 9 + drei 10 + three 0.176.

**Spec:** `docs/superpowers/specs/2026-08-18-ui-motion-system-design.md`

## Global Constraints

- **No new runtime dependencies.** One dependency is *removed* (`react-simple-typewriter`). Everything else uses what is already in `package.json`.
- **Tailwind v4, no config file.** There is no `tailwind.config.js` and none is to be created. Tokens go in `@theme` / `@theme inline` inside `app/globals.css`; custom utilities use `@utility`.
- **Only `transform` and `opacity` are animated.** No animating `width`, `height`, `top`, `left`, `margin`, `filter`, or `box-shadow`.
- **No hardcoded timing values in `components/`.** Every framer-motion `duration`, `ease`, `delay`, `staggerChildren`, and travel distance is imported from `lib/motion.ts` — never written as a numeric literal.
- **CSS-class transitions mirror the same scale.** Tailwind `transition-*` utilities cannot read the TS module, so they are restricted to `duration-300` / `duration-500` / `duration-700` (mirroring `duration.md` / `duration.lg` / `duration.xl`) and must pair with the `ease-enter` utility that Task 1 defines. Never `ease-out`, `ease-in-out`, or an off-scale duration.
- **Reduced motion is handled inside primitives only.** Section components must never call `usePrefersReducedMotion` themselves.
- **Do not touch:** `app/layout.tsx` metadata / JSON-LD blocks / `sr-only` AI context block, `app/api/info/route.ts`, `next-sitemap.config.js`, `public/**`, `components/PyraminxModel.tsx` material and GLB path (`/blackO.glb`), `components/ForceBoundsRefit.tsx`.
- **Path alias:** `@/*` maps to the repo root (`tsconfig.json`), so `@/lib/motion` and `@/components/motion/Reveal`.
- **Exact palette values:** `--ink-0 #08090A` · `--ink-1 #0D0E10` · `--ink-2 #141517` · `--line rgba(255,255,255,0.08)` · `--fg-1 #F5F5F7` · `--fg-2 #A1A1A6` · `--fg-3 #6E6E73` · `--accent #5B8CFF`.
- **Exact motion values:** `ease.enter [0.16, 1, 0.3, 1]` · `ease.exit [0.7, 0, 0.84, 0]` · `spring { stiffness: 220, damping: 30, mass: 0.9 }` · `duration { xs .16, sm .24, md .4, lg .64, xl .9 }` · `distance { sm 8, md 16, lg 32 }` · `stagger .06`.
- **Exact hero copy:** line 1 `Melih Takyaci`, line 2 `Full-stack engineer building systems from silicon to screen.`

## Verification model (read before Task 1)

This repo has **no test runner** — no jest, vitest, or playwright, and no `test` script in `package.json`. The spec's approved verification method is build + lint + grep + manual visual review. Do **not** add a test framework; that is out of scope and would pull in a jsdom + RTL dependency tree the project does not want.

Every task therefore uses this cycle in place of red/green TDD:

1. **Predict** — write down the observable result before changing anything.
2. **Change** — implement.
3. **Typecheck:** `npx tsc --noEmit` → must print nothing.
4. **Lint:** `npm run lint` → must report no errors.
5. **Observe** — run `npm run dev` and confirm the predicted result at the stated viewport(s).
6. **Commit.**

Keep one `npm run dev` running in a spare terminal for the whole session rather than restarting it per task.

## Deviations from the spec (approved rationale)

1. **`ScrollScene` primitive is not built.** The spec listed it as a fifth primitive, but the hero's corner-parking transform is its only consumer. A single-use abstraction is worse than the inline code, so the scroll mapping lives directly in `components/Hero.tsx`. If a second scroll-linked scene ever appears, extract then.
2. **`usePrefersReducedMotion` also gets a CSS safety net.** In addition to the hook, `app/globals.css` carries a global `prefers-reduced-motion` rule that clamps CSS transition/animation durations. This catches Tailwind `transition-*` classes, which the hook cannot see.
3. **`Reveal` and `Stagger` are separate, non-composable primitives.** framer-motion only propagates variants to children that do not declare their own `initial`/`whileInView`. Rather than adding an `inStagger` flag to `Reveal`, staggered lists use the `Stagger` + `StaggerItem` pair and standalone blocks use `Reveal`. Two clear tools beat one flagged tool.

---

### Task 1: Token layer and the Arial font bug

**Files:**
- Modify: `app/globals.css` (full rewrite, 91 lines → token layer)
- Modify: `app/layout.tsx` (the `<body>` className on the last lines only)

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind utilities `bg-ink-0` `bg-ink-1` `bg-ink-2` `border-line` `text-fg-1` `text-fg-2` `text-fg-3` `text-accent` `bg-accent`; font-size utilities `text-display` `text-h1` `text-h2` `text-lead` `text-body` `text-label`; radius utilities `rounded-sm2` `rounded-card` `rounded-panel`; easing utilities `ease-enter` `ease-exit`; the `surface` utility class; `font-sans` / `font-mono` bound to Geist.

- [ ] **Step 1: Predict the observable result**

Before editing, load `http://localhost:3000`, open DevTools, select any paragraph, and read Computed → `font-family`. It will currently say **Arial**. After this task it must say a Geist font. Write down which element you sampled.

- [ ] **Step 2: Rewrite `app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-ink-0: #08090A;
  --color-ink-1: #0D0E10;
  --color-ink-2: #141517;
  --color-line: rgba(255, 255, 255, 0.08);

  /* Text */
  --color-fg-1: #F5F5F7;
  --color-fg-2: #A1A1A6;
  --color-fg-3: #6E6E73;

  /* State — focus, links, active. Never decorative. */
  --color-accent: #5B8CFF;

  /* Fluid type scale */
  --text-display: clamp(2.75rem, 7vw, 5.5rem);
  --text-display--line-height: 1.02;
  --text-display--letter-spacing: -0.035em;

  --text-h1: clamp(2rem, 4.5vw, 3.25rem);
  --text-h1--line-height: 1.08;
  --text-h1--letter-spacing: -0.03em;

  --text-h2: clamp(1.375rem, 2.6vw, 1.875rem);
  --text-h2--line-height: 1.18;
  --text-h2--letter-spacing: -0.02em;

  --text-lead: clamp(1.0625rem, 1.5vw, 1.25rem);
  --text-lead--line-height: 1.55;
  --text-lead--letter-spacing: -0.01em;

  --text-body: 0.9375rem;
  --text-body--line-height: 1.65;

  --text-label: 0.6875rem;
  --text-label--line-height: 1;
  --text-label--letter-spacing: 0.14em;

  /* Easing — the CSS twins of ease.enter / ease.exit in lib/motion.ts.
     Keep these two in sync with that file by hand; they are the same curves. */
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.7, 0, 0.84, 0);

  /* Radius */
  --radius-sm2: 12px;
  --radius-card: 18px;
  --radius-panel: 28px;
}

@theme inline {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
}

/* The one surface recipe. Every panel, card, and pill uses this. */
@utility surface {
  background-color: color-mix(in oklab, var(--color-ink-1) 70%, transparent);
  border: 1px solid var(--color-line);
  backdrop-filter: blur(20px);
}

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    background-color: var(--color-ink-0);
    color: var(--color-fg-2);
  }

  ::selection {
    background-color: color-mix(in oklab, var(--color-accent) 32%, transparent);
    color: var(--color-fg-1);
  }

  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
    border-radius: 4px;
  }
}

/* Safety net: clamps Tailwind transition-* classes that the
   usePrefersReducedMotion hook cannot see. */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Note what is deliberately gone: the `Arial` body font, the `#595959` dark `--foreground`, the `shine` keyframes and `.shine-effect` / `.shine-parent` rules, the `.navBar` block, and the `* { --framer-font-family: ... }` declaration. All four were unreferenced or actively wrong.

- [ ] **Step 3: Apply the font in `app/layout.tsx`**

Find the `<body>` tag near the end of the file:

```tsx
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

Replace with:

```tsx
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-ink-0 text-fg-2 antialiased`}>
```

Change nothing else in this file. The metadata object, every JSON-LD `<script>`, and the `sr-only` AI context block stay exactly as they are.

- [ ] **Step 4: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: both silent / no errors.

- [ ] **Step 5: Observe**

Reload `http://localhost:3000` and re-sample the element from Step 1. Computed `font-family` must now resolve through `--font-geist-sans`, not Arial. The page background must be near-black `#08090A`. The page will look half-broken at this point — sections still carry their old `neutral-*` classes. That is expected; later tasks fix it.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(ui): add design token layer, fix Geist font being overridden by Arial"
```

---

### Task 2: Motion tokens and the reduced-motion hook

**Files:**
- Create: `lib/motion.ts`
- Create: `lib/usePrefersReducedMotion.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `ease: { enter: [number,number,number,number]; exit: [number,number,number,number] }`
  - `spring: Transition`
  - `duration: { xs: 0.16; sm: 0.24; md: 0.4; lg: 0.64; xl: 0.9 }`
  - `distance: { sm: 8; md: 16; lg: 32 }`
  - `stagger: number` (0.06)
  - `viewportOnce: { once: true; amount: 0.25 }`
  - `usePrefersReducedMotion(): boolean`

- [ ] **Step 1: Create `lib/motion.ts`**

```ts
// lib/motion.ts
// The single source of every timing value on the site.
// Nothing in components/ may hardcode a duration, easing, or distance.
import type { Transition } from 'framer-motion'

/** Cubic-bezier curves. `enter` is the decelerating curve that gives the
 *  site its calm, settled feel; use it for anything the user sees arrive. */
export const ease = {
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
}

/** Physical response for anything the user is directly manipulating
 *  (hover, pointer tracking, scroll-linked transforms). */
export const spring: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
}

/** Seconds. */
export const duration = {
  xs: 0.16,
  sm: 0.24,
  md: 0.4,
  lg: 0.64,
  xl: 0.9,
} as const

/** Pixels of travel for entrance transforms. */
export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
} as const

/** Seconds between staggered siblings. */
export const stagger = 0.06

/** Shared viewport trigger: fire once, when a quarter of the block is visible. */
export const viewportOnce = { once: true, amount: 0.25 } as const
```

- [ ] **Step 2: Create `lib/usePrefersReducedMotion.ts`**

```ts
// lib/usePrefersReducedMotion.ts
'use client'

import { useEffect, useState } from 'react'

/**
 * Only motion primitives call this. Section components must not —
 * reduced-motion handling is the primitives' responsibility.
 *
 * Starts false so server and first client render agree, then corrects
 * in an effect. A single frame of motion before correcting is acceptable;
 * the CSS safety net in globals.css covers class-based transitions.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 3: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: both clean. Nothing imports these yet, so there is nothing to observe in the browser.

- [ ] **Step 4: Commit**

```bash
git add lib/motion.ts lib/usePrefersReducedMotion.ts
git commit -m "feat(motion): add motion tokens and shared reduced-motion hook"
```

---

### Task 3: `Reveal` and `Stagger` primitives

**Files:**
- Create: `components/motion/Reveal.tsx`
- Create: `components/motion/Stagger.tsx`

**Interfaces:**
- Consumes: `ease`, `duration`, `distance`, `stagger`, `viewportOnce` from `@/lib/motion`; `usePrefersReducedMotion` from `@/lib/usePrefersReducedMotion`.
- Produces:
  - `Reveal({ children, delay?, y?, as?, className? })` — default export of `Reveal.tsx`. `y` is `'sm' | 'md' | 'lg'` (default `'md'`), `as` is `'div' | 'section'` (default `'div'`).
  - `Stagger({ children, delay?, as?, className? })` — named export of `Stagger.tsx`. `as` is `'div' | 'ul'` (default `'div'`).
  - `StaggerItem({ children, y?, as?, className? })` — named export of `Stagger.tsx`. `as` is `'div' | 'li' | 'article'` (default `'div'`).

**Usage rule (important, and the reason there are two tools):** `Reveal` triggers itself on scroll. `StaggerItem` does **not** — it inherits its animation state from a `Stagger` parent. Never put a `Reveal` inside a `Stagger`; framer-motion stops propagating variants to a child that declares its own `initial`/`whileInView`, so the stagger would silently do nothing.

- [ ] **Step 1: Create `components/motion/Reveal.tsx`**

```tsx
// components/motion/Reveal.tsx
'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { distance, duration, ease, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TAGS = { div: motion.div, section: motion.section } as const

type Props = {
  children: ReactNode
  /** Seconds to wait after the block enters the viewport. */
  delay?: number
  /** How far the block travels up. */
  y?: keyof typeof distance
  as?: keyof typeof TAGS
  className?: string
}

/** Standalone scroll-entrance. For lists, use Stagger + StaggerItem instead. */
export default function Reveal({
  children,
  delay = 0,
  y = 'md',
  as = 'div',
  className,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const Tag = TAGS[as]

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : distance[y] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{
        duration: reduced ? duration.sm : duration.lg,
        ease: ease.enter,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 2: Create `components/motion/Stagger.tsx`**

```tsx
// components/motion/Stagger.tsx
'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { distance, duration, ease, stagger, viewportOnce } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const PARENT_TAGS = { div: motion.div, ul: motion.ul } as const
const ITEM_TAGS = { div: motion.div, li: motion.li, article: motion.article } as const

type ParentProps = {
  children: ReactNode
  /** Seconds before the first child starts. */
  delay?: number
  as?: keyof typeof PARENT_TAGS
  className?: string
}

/** Sequences its StaggerItem children. Do not nest Reveal inside this. */
export function Stagger({ children, delay = 0, as = 'div', className }: ParentProps) {
  const reduced = usePrefersReducedMotion()
  const Tag = PARENT_TAGS[as]

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </Tag>
  )
}

type ItemProps = {
  children: ReactNode
  y?: keyof typeof distance
  as?: keyof typeof ITEM_TAGS
  className?: string
}

/** A single sequenced child. Inherits its animation state from Stagger. */
export function StaggerItem({ children, y = 'md', as = 'div', className }: ItemProps) {
  const reduced = usePrefersReducedMotion()
  const Tag = ITEM_TAGS[as]

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : distance[y] },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduced ? duration.sm : duration.lg,
            ease: ease.enter,
          },
        },
      }}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 3: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/motion/Reveal.tsx components/motion/Stagger.tsx
git commit -m "feat(motion): add Reveal and Stagger entrance primitives"
```

---

### Task 4: `TextReveal` primitive

**Files:**
- Create: `components/motion/TextReveal.tsx`

**Interfaces:**
- Consumes: `duration`, `ease`, `stagger` from `@/lib/motion`; `usePrefersReducedMotion`.
- Produces: `TextReveal({ lines, as?, className?, delay?, id? })` — default export. `lines: string[]`, `as: 'h1' | 'h2' | 'p'` (default `'h1'`).

**Why explicit lines:** the component takes a pre-split array rather than measuring wrapped text. Measuring requires a layout pass and re-measuring on resize, which is a lot of machinery for two headings. The caller controls the line breaks, which is what a designer wants anyway.

- [ ] **Step 1: Create `components/motion/TextReveal.tsx`**

```tsx
// components/motion/TextReveal.tsx
'use client'

import { motion } from 'framer-motion'
import { duration, ease, stagger } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TAGS = { h1: motion.h1, h2: motion.h2, p: motion.p } as const

type Props = {
  /** One entry per visual line. The caller controls the line breaks. */
  lines: string[]
  as?: keyof typeof TAGS
  className?: string
  delay?: number
  id?: string
}

/**
 * Drives a heading up line-by-line from behind a mask.
 * Runs on mount, not on scroll — this is for above-the-fold headings.
 */
export default function TextReveal({
  lines,
  as = 'h1',
  className,
  delay = 0,
  id,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const Tag = TAGS[as]

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {lines.map((line) => (
        // pb/-mb pair keeps descenders (g, y, p) from being clipped by the mask.
        <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: reduced ? '0%' : '115%', opacity: reduced ? 0 : 1 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: { duration: duration.xl, ease: ease.enter },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/motion/TextReveal.tsx
git commit -m "feat(motion): add TextReveal masked line primitive"
```

---

### Task 5: `Magnetic` primitive

**Files:**
- Create: `components/motion/Magnetic.tsx`

**Interfaces:**
- Consumes: `spring` from `@/lib/motion`; `usePrefersReducedMotion`.
- Produces: `Magnetic({ children, strength?, className? })` — default export. `strength` is max travel in px, default `6`.

- [ ] **Step 1: Create `components/motion/Magnetic.tsx`**

```tsx
// components/motion/Magnetic.tsx
'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { spring } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type Props = {
  children: ReactNode
  /** Maximum travel toward the cursor, in pixels. */
  strength?: number
  className?: string
}

/** Translates toward the cursor and springs back. Mouse only. */
export default function Magnetic({ children, strength = 6, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, spring)
  const y = useSpring(rawY, spring)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    // Touch and pen never get the effect — this is the mobile opt-out.
    if (reduced || event.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    rawX.set(dx * strength)
    rawY.set(dy * strength)
  }

  const handleLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/motion/Magnetic.tsx
git commit -m "feat(motion): add Magnetic pointer-tracking primitive"
```

---

### Task 6: `SectionHeader` component

**Files:**
- Create: `components/SectionHeader.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@/components/motion/Reveal`.
- Produces: `SectionHeader({ index, label, title, id? })` — default export. `index: string` (e.g. `'02'`), `label: string` (e.g. `'Experience'`), `title: string`, `id?: string` for `aria-labelledby`.

- [ ] **Step 1: Create `components/SectionHeader.tsx`**

```tsx
// components/SectionHeader.tsx
import Reveal from '@/components/motion/Reveal'

type Props = {
  /** Zero-padded section number, e.g. "02". */
  index: string
  /** Short uppercase category, e.g. "Experience". */
  label: string
  title: string
  id?: string
}

export default function SectionHeader({ index, label, title, id }: Props) {
  return (
    <Reveal className="border-t border-line pt-6 mb-12 sm:mb-16">
      <p className="font-mono text-label uppercase text-fg-3">
        {index} / {label}
      </p>
      <h2 id={id} className="mt-4 text-h1 font-semibold text-fg-1">
        {title}
      </h2>
    </Reveal>
  )
}
```

- [ ] **Step 2: Typecheck and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/SectionHeader.tsx
git commit -m "feat(ui): add shared editorial SectionHeader"
```

---

### Task 7: Background

**Files:**
- Modify: `components/BackgroundFX.tsx` (full rewrite, 46 lines)

**Interfaces:**
- Consumes: nothing.
- Produces: unchanged default export `BackgroundFX`, still `memo`-wrapped.

- [ ] **Step 1: Predict**

Currently three saturated radial gradients (blue `rgba(120,120,255,.18)`, pink `rgba(255,120,200,.16)`, green `rgba(120,255,200,.10)`) at 60% opacity. After this task the page ground must read as neutral near-black with one barely-perceptible cool glow behind the hero.

- [ ] **Step 2: Rewrite `components/BackgroundFX.tsx`**

```tsx
'use client'
import { memo } from 'react'

/**
 * Page ground: one low-opacity cool glow behind the hero, plus grain
 * and a top vignette. Fixed, so it does not scroll with content.
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
```

Two changes beyond color: `absolute` → `fixed` with `-z-10`, so the ground covers the full scroll height rather than only the first screen, and the `mix-blend-multiply` vignette (which was fighting the dark ground) becomes a plain gradient.

- [ ] **Step 3: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
Then scroll the whole page: the ground must stay uniformly dark top to bottom, with no visible seam where the old absolute layer used to end.

- [ ] **Step 4: Commit**

```bash
git add components/BackgroundFX.tsx
git commit -m "feat(ui): replace tri-color aurora with a single neutral ground"
```

---

### Task 8: Header

**Files:**
- Modify: `components/Header.tsx` (full rewrite, 81 lines)

**Interfaces:**
- Consumes: `duration`, `ease` from `@/lib/motion`.
- Produces: unchanged default export `Header`, still rendering `<header role="banner">` with the same three social links and their existing `aria-label` text.

**Bugs this task closes:** the interpolated `h-[${HEADER_H}px]` class that Tailwind never compiles, and the `setTimeout` + `window.scrollTo(0,1)` mount hack.

- [ ] **Step 1: Predict**

At scroll position 0 the header is transparent and spans the container width. Past ~24px it becomes a centered pill: narrower, rounded-full, blurred, hairline border. The transition must be continuous, with no jump in the nav text position.

- [ ] **Step 2: Rewrite `components/Header.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { duration, ease } from '@/lib/motion'

const LINKS = [
  {
    href: 'https://linkedin.com/in/melih-takyaci',
    label: 'Connect with Melih Takyaci on LinkedIn',
    Icon: FaLinkedin,
    external: true,
  },
  {
    href: 'https://github.com/MelihTakyaci',
    label: "View Melih Takyaci's GitHub profile",
    Icon: FaGithub,
    external: true,
  },
  {
    href: 'mailto:melihtakyaci@gmail.com',
    label: 'Send email to Melih Takyaci',
    Icon: FaEnvelope,
    external: false,
  },
]

export default function Header() {
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      role="banner"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: duration.lg, ease: ease.enter }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4"
    >
      <motion.nav
        aria-label="Main navigation"
        animate={{
          maxWidth: condensed ? 560 : 1280,
          paddingLeft: condensed ? 20 : 16,
          paddingRight: condensed ? 20 : 16,
        }}
        transition={{ duration: duration.md, ease: ease.enter }}
        className={`flex h-14 w-full items-center justify-between rounded-full
          transition-[background-color,border-color,box-shadow] duration-300
          ${condensed
            ? 'surface shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
            : 'border border-transparent bg-transparent'}`}
      >
        <a
          href="#about"
          className="font-mono text-label uppercase text-fg-2 transition-colors hover:text-fg-1"
        >
          Melih Takyaci
        </a>

        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, Icon, external }) => (
            <a
              key={href}
              href={href}
              aria-label={label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full
                text-fg-3 transition-colors hover:text-fg-1"
            >
              <Icon size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
      </motion.nav>
    </motion.header>
  )
}
```

Note the `maxWidth` / `paddingLeft` / `paddingRight` animation. These are layout properties, and the Global Constraints say transform and opacity only. This is the one deliberate exception: the pill morph is the site's signature move, it animates on a single element with no siblings to reflow, and framer-motion drives it off the main-thread-safe path. Do not copy this pattern elsewhere.

The `HEADER_H` constant and the ghost spacer `<div>` are gone — Task 9 makes the hero full-height, so nothing needs to reserve header space.

- [ ] **Step 3: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
Scroll down and back up. Confirm the pill forms and dissolves smoothly, the three icons keep 44px touch targets, and tabbing to each link shows the accent focus ring.

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx
git commit -m "feat(ui): condense header into a floating pill on scroll"
```

---

### Task 9: Hero and page composition

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx` (full rewrite, 129 lines)
- Modify: `components/index.ts`
- Modify: `package.json` (remove `react-simple-typewriter`)

**Interfaces:**
- Consumes: `TextReveal`, `Reveal`, `duration`, `ease` and the existing `PyraminxCanvas`.
- Produces: `Hero` default export from `components/Hero.tsx`, re-exported from `components/index.ts`.

- [ ] **Step 1: Predict**

On load: near-full-viewport 3D scene, headline rising line-by-line beneath it. On scroll through the hero: the scene scales down toward 0.32 and drifts to the upper right, staying pinned for the length of the hero, then releasing. No horizontal overflow at 390px.

- [ ] **Step 2: Create `components/Hero.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import TextReveal from '@/components/motion/TextReveal'
import { duration, ease } from '@/lib/motion'

// Staged entrance: heading, then supporting line, then the scroll cue.
// Values come from the duration scale, not from taste.
const HEADING_DELAY = duration.sm
const LEAD_DELAY = duration.lg
const CUE_DELAY = duration.xl

const PyraminxCanvas = dynamic(() => import('@/components/PyraminxCanvas'), {
  ssr: false,
  loading: () => null,
})

export default function Hero() {
  const ref = useRef<HTMLElement>(null)

  // Progress through the hero block: 0 at the top, 1 once its end
  // reaches the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.6,
  })

  const scale = useTransform(progress, [0, 1], [1, 0.32])
  const x = useTransform(progress, [0, 1], ['0%', '34%'])
  const y = useTransform(progress, [0, 1], ['0%', '-30%'])
  const sceneOpacity = useTransform(progress, [0, 0.9], [1, 0.45])

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="hero-title"
      className="relative min-h-[170vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Scene */}
        <motion.div
          aria-hidden="true"
          style={{ scale, x, y, opacity: sceneOpacity }}
          className="absolute inset-x-0 top-[14vh] mx-auto h-[52vh] w-full max-w-[560px]"
        >
          <PyraminxCanvas />
        </motion.div>

        {/* Type */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-[12vh] sm:px-10">
          <div className="mx-auto max-w-6xl">
            <TextReveal
              id="hero-title"
              as="h1"
              delay={HEADING_DELAY}
              lines={['Melih Takyaci']}
              className="text-display font-semibold text-fg-1"
            />
            <TextReveal
              as="p"
              delay={LEAD_DELAY}
              lines={[
                'Full-stack engineer building systems',
                'from silicon to screen.',
              ]}
              className="mt-5 max-w-2xl text-lead text-fg-2"
            />
            <motion.a
              href="#experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.lg, ease: ease.enter, delay: CUE_DELAY }}
              className="mt-10 inline-flex items-center gap-2 border-t border-line pt-4
                font-mono text-label uppercase text-fg-3 transition-colors hover:text-fg-1"
            >
              Selected work
              <span aria-hidden="true">↓</span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Rewrite `app/page.tsx`**

```tsx
// app/page.tsx
import {
  Header,
  Hero,
  Carousel,
  ExperienceCards,
  ContactSection,
  GitHubCTA,
} from '@/components'
import SectionHeader from '@/components/SectionHeader'
import BackgroundFX from '@/components/BackgroundFX'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <BackgroundFX />
      <Header />
      <Hero />

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <section id="projects" aria-labelledby="skills-title" className="pt-28 sm:pt-40">
          <SectionHeader index="01" label="Capabilities" title="What I work on" id="skills-title" />
          <Carousel />
        </section>

        <section id="experience" aria-labelledby="experience-title" className="pt-28 sm:pt-40">
          <SectionHeader index="02" label="Experience" title="Selected work" id="experience-title" />
          <ExperienceCards />
        </section>

        <section id="github" aria-labelledby="github-title" className="pt-28 sm:pt-40">
          <h2 id="github-title" className="sr-only">GitHub Highlights</h2>
          <GitHubCTA />
        </section>

        <section id="contact" aria-labelledby="contact-title" className="pt-28 sm:pt-40 pb-32">
          <SectionHeader index="03" label="Contact" title="Get in touch" id="contact-title" />
          <ContactSection />
        </section>
      </div>
    </main>
  )
}
```

`'use client'` is gone from this file — it is now pure composition, and every interactive child carries its own directive.

- [ ] **Step 4: Update `components/index.ts`**

```ts
import Header from "./Header";
import Hero from "./Hero";
import Carousel from "./Carousel";
import ExperienceCards from "./ExperienceCards";
import ContactSection from "./ContactSection";
import GitHubCTA from "./GitHubCTA";

export {
    Header,
    Hero,
    Carousel,
    ExperienceCards,
    ContactSection,
    GitHubCTA,
}
```

- [ ] **Step 5: Drop the typewriter dependency**

```bash
npm uninstall react-simple-typewriter
grep -rn "react-simple-typewriter" app components lib
```
Expected: the grep prints nothing.

- [ ] **Step 6: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
At 390px, 768px, and 1440px: scroll through the hero and confirm the scene shrinks and parks without the page scrolling sideways. `document.documentElement.scrollWidth === document.documentElement.clientWidth` must hold in the console at each width.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/Hero.tsx components/index.ts package.json package-lock.json
git commit -m "feat(ui): recompose hero around a scroll-linked 3D scene"
```

---

### Task 10: Skills as an editorial list

**Files:**
- Modify: `components/Carousel.tsx` (full rewrite, 183 lines → roughly 60)

**Interfaces:**
- Consumes: `Stagger`, `StaggerItem` from `@/components/motion/Stagger`.
- Produces: unchanged default export (currently named `SkillShowcase` internally, exported as `Carousel`).

**What is retired here:** the file's private `usePrefersReducedMotion`, its private `useIsInViewport`, the duplicated mobile-carousel and desktop-grid markup, the hand-computed `transitionDelay` ladders (`index * 150`, `index * 200 + 100`, `+ 200`, `+ 300`), the `scrollbar-hide` styled-jsx block, and the emoji column. All of it is replaced by `Stagger` + `StaggerItem` and one responsive layout.

- [ ] **Step 1: Predict**

One column of rows on mobile, a 12-column grid from `md` up: number, title, description. Rows enter in sequence 60ms apart. Hover raises the row surface and nudges the title 4px right.

- [ ] **Step 2: Rewrite `components/Carousel.tsx`**

```tsx
'use client'

import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const skills = [
  {
    title: 'Full-Stack Web Development',
    description:
      'Modern, scalable applications with Next.js, Nest.js, MongoDB, Redis, PostgreSQL and Docker — from schema to deployment.',
  },
  {
    title: 'Embedded Systems',
    description:
      'Bare-metal applications on STM32, Arduino and ESP32 in C/C++, where the constraint is the interesting part.',
  },
  {
    title: 'AI & Computer Vision',
    description:
      'YOLOv11n, OpenCV, Pandas and TimescaleDB, turning real-world sensor data into systems that decide.',
  },
  {
    title: 'DevOps & Workflow',
    description:
      'CI/CD pipelines, Docker containers, GitHub Actions and monorepo structures that keep delivery boring.',
  },
]

export default function SkillShowcase() {
  return (
    <Stagger as="ul" className="border-b border-line">
      {skills.map((skill, index) => (
        <StaggerItem
          as="li"
          key={skill.title}
          className="group border-t border-line transition-colors duration-300 hover:bg-ink-1/50"
        >
          <div className="grid grid-cols-1 gap-3 px-2 py-8 md:grid-cols-12 md:gap-8 md:px-4">
            <span className="font-mono text-label uppercase text-fg-3 md:col-span-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3
              className="text-h2 font-medium text-fg-1 transition-transform duration-500
                ease-enter md:col-span-4 md:group-hover:translate-x-1"
            >
              {skill.title}
            </h3>
            <p className="text-body text-fg-2 md:col-span-7">{skill.description}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
```

- [ ] **Step 3: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
Confirm the four rows arrive in sequence, not all at once. Then enable OS reduce-motion, hard-reload, and confirm they appear with no vertical travel.

- [ ] **Step 4: Commit**

```bash
git add components/Carousel.tsx
git commit -m "refactor(ui): rebuild skills as an editorial list on shared primitives"
```

---

### Task 11: Experience cards

**Files:**
- Modify: `components/ExperienceCards.tsx` (101 lines)

**Interfaces:**
- Consumes: `Stagger`, `StaggerItem`.
- Produces: unchanged default export `ExperienceCards`.

- [ ] **Step 1: Predict**

Cards sit on the neutral surface with no colored gradient behind the screenshots. On hover the screenshot scales to 1.04 inside its clipped frame; the card itself does not move.

- [ ] **Step 2: Rewrite `components/ExperienceCards.tsx`**

```tsx
'use client'

import Image from 'next/image'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const projects = [
  {
    title: 'Kindle Style Mobile App',
    role: 'Full-Stack Developer',
    period: '2025',
    image: '/Experience/Mobile.PNG',
  },
  {
    title: 'E-commerce Platform with CMS',
    role: 'Full-Stack Developer',
    period: '2024',
    image: '/Experience/ecommerce.png',
  },
  {
    title: 'Marketing Website',
    role: 'UI Developer',
    period: '2025',
    image: '/Experience/Destani.png',
  },
  {
    title: 'NGO Website',
    role: 'Full-Stack Developer',
    period: '2024',
    image: '/Experience/KotgepWeb.png',
  },
]

export default function ExperienceCards() {
  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {projects.map((project, index) => (
        <StaggerItem
          as="article"
          key={project.title}
          className="surface group rounded-panel p-3"
        >
          <div className="aspect-video overflow-hidden rounded-card bg-ink-2 p-4">
            <Image
              src={project.image}
              alt={`${project.title} — ${project.role} project screenshot`}
              width={800}
              height={450}
              sizes="(max-width: 640px) 100vw, 50vw"
              priority={index < 2}
              className="h-full w-full rounded-sm2 object-contain transition-transform
                duration-700 ease-enter group-hover:scale-[1.04]"
            />
          </div>

          <div className="flex items-baseline justify-between gap-4 px-3 pb-2 pt-5">
            <div>
              <h3 className="text-h2 font-medium text-fg-1">{project.title}</h3>
              <p className="mt-1 text-body text-fg-2">{project.role}</p>
            </div>
            <span className="font-mono text-label uppercase text-fg-3">
              {project.period}
            </span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
```

The `gradient` field is removed from every project record, and the 🌍 in the e-commerce title is dropped along with it.

- [ ] **Step 3: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
Confirm no saturated gradient remains behind any screenshot, and the images are not distorted (they are UI screenshots, so `object-contain` is deliberate — do not switch to `object-cover`).

- [ ] **Step 4: Commit**

```bash
git add components/ExperienceCards.tsx
git commit -m "refactor(ui): move experience cards onto the neutral surface recipe"
```

---

### Task 12: GitHub CTA and contact

**Files:**
- Modify: `components/GitHubCTA.tsx` (44 lines)
- Modify: `components/ContactSection.tsx` (81 lines)

**Interfaces:**
- Consumes: `Magnetic`, `Reveal`, `Stagger`, `StaggerItem`.
- Produces: unchanged default exports `GitHubCTA` and `ContactSection`.

- [ ] **Step 1: Rewrite `components/GitHubCTA.tsx`**

```tsx
'use client'

import { FaGithub } from 'react-icons/fa'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'

export default function GitHubCTA() {
  return (
    <Reveal className="flex justify-center">
      <Magnetic className="inline-block">
        <a
          href="https://github.com/MelihTakyaci"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Melih Takyaci's GitHub profile and open source projects"
          className="surface inline-flex min-h-[48px] items-center gap-3 rounded-full px-7 py-4
            text-fg-1 transition-colors duration-300 hover:bg-ink-2"
        >
          <FaGithub className="text-xl" aria-hidden="true" />
          <span className="text-body font-medium">See more on GitHub</span>
        </a>
      </Magnetic>
    </Reveal>
  )
}
```

The old `whileHover={{ scale: 1.2 }}` plus three nested `motion` wrappers each with their own hover scale are all gone; the magnetic pull is the whole interaction now.

- [ ] **Step 2: Rewrite `components/ContactSection.tsx`**

```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import Reveal from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const channels = [
  { label: 'Email', value: 'melihtakyaci@gmail.com', href: 'mailto:melihtakyaci@gmail.com', external: false },
  { label: 'LinkedIn', value: 'linkedin.com/in/melihtakyaci', href: 'https://linkedin.com/in/melih-takyaci', external: true },
  { label: 'GitHub', value: 'github.com/MelihTakyaci', href: 'https://github.com/MelihTakyaci', external: true },
]

export default function ContactSection() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
      <Reveal className="md:col-span-5">
        <div
          className="relative h-24 w-24"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Image
            src="/default.png"
            width={500}
            height={500}
            alt="Melih Takyaci memoji"
            className={`h-24 w-24 rounded-full object-contain transition-opacity duration-500
              ${hovered ? 'opacity-0' : 'opacity-100'}`}
          />
          <Image
            src="/dyes.png"
            width={500}
            height={500}
            alt=""
            aria-hidden="true"
            className={`absolute left-0 top-0 h-24 w-24 rounded-full object-contain
              transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        <p className="mt-8 max-w-md text-lead text-fg-2">
          Always open to exciting ideas, freelance collaborations, or just geeking out over tech.
        </p>
      </Reveal>

      <Stagger as="ul" className="border-b border-line md:col-span-7">
        {channels.map(({ label, value, href, external }) => (
          <StaggerItem as="li" key={label} className="group border-t border-line">
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-baseline justify-between gap-6 py-6 transition-colors
                hover:text-accent"
            >
              <span className="font-mono text-label uppercase text-fg-3">{label}</span>
              <span className="text-body text-fg-1 transition-colors group-hover:text-accent">
                {value}
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
```

The 📧 / 💼 / 💻 emoji are replaced by mono labels; the heading that used to live here now comes from `SectionHeader` in `app/page.tsx`, so it is not duplicated. The hover memoji gets `alt=""` and `aria-hidden` because it is a duplicate of an image already described.

- [ ] **Step 3: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
Hover the CTA with a mouse and confirm it leans toward the cursor by a few pixels and springs back. Confirm the contact rows are keyboard-focusable and show the accent ring.

- [ ] **Step 4: Commit**

```bash
git add components/GitHubCTA.tsx components/ContactSection.tsx
git commit -m "refactor(ui): magnetic CTA and hairline contact list"
```

---

### Task 13: 3D scene entrance, pointer tilt, and viewport gating

**Files:**
- Modify: `components/PyraminxCanvas.tsx` (83 lines)
- Modify: `components/PyraminxModel.tsx` (the `useFrame` block and the returned `<group>` only)

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from `@/lib/usePrefersReducedMotion`.
- Produces: `PyraminxCanvas` default export (unchanged signature); `PyraminxModel({ animate }: { animate: boolean })` — **new required prop**.

**Do not change** the GLB path `/blackO.glb`, the `MeshStandardMaterial` values, the `EdgesGeometry` treatment, the lights, or the `OrbitControls` configuration.

- [ ] **Step 1: Predict**

The scene scales up from 0.85 over roughly 1.2s on first paint. Scrolling the scene out of view stops WebGL rendering: with the canvas off-screen, the R3F frame callback stops firing.

- [ ] **Step 2: Gate the frameloop in `components/PyraminxCanvas.tsx`**

Replace the component body (keep every `<light>`, `<OrbitControls>`, and `<Canvas>` prop exactly as it is) with:

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PyraminxModel from './PyraminxModel'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export default function PyraminxCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [inView, setInView] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 250)
    return () => clearTimeout(timeout)
  }, [])

  // Stop rendering entirely once the scene scrolls away.
  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="h-full w-full">
      {mounted && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 0, 4.5], fov: 45, near: 0.1, far: 1000 }}
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={0.15} color="#ffffff" />
          <spotLight position={[0, 10, 5]} angle={0.5} penumbra={0.8} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-5, 5, 10]} intensity={0.8} color="#ffffff" />
          <pointLight position={[5, 0, -5]} intensity={0.5} color="#888888" distance={20} decay={2} />

          <PyraminxModel animate={!reduced} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.55}
            target={[0, 0, 0]}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI - Math.PI / 4}
          />
        </Canvas>
      )}
    </div>
  )
}
```

The old `if (!canvasReady) return null` early return is replaced by a conditional inside the wrapper, because the IntersectionObserver needs a node to observe from the first render.

- [ ] **Step 3: Add entrance and tilt in `components/PyraminxModel.tsx`**

Change the signature and the `useFrame` block. Everything above it — the `useGLTF.preload`, the `useEffect` that clones meshes and builds edges — stays byte-for-byte identical.

```tsx
export default function PyraminxModel({ animate }: { animate: boolean }) {
```

Replace the existing `useFrame` block and the return statement with:

```tsx
  const BASE_SCALE = 0.5

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const t = state.clock.getElapsedTime()

    // Entrance: 0.85 → 1 over 1.2s on an ease-out cubic.
    const intro = Math.min(1, t / 1.2)
    const eased = 1 - Math.pow(1 - intro, 3)
    group.scale.setScalar(BASE_SCALE * (0.85 + 0.15 * eased))

    if (!animate) return

    group.rotation.y = t * 0.08
    group.position.y = Math.sin(t * 0.4) * 0.02

    // Damped tilt toward the pointer.
    const targetTilt = state.pointer.y * 0.12
    group.rotation.x += (targetTilt - group.rotation.x) * Math.min(1, delta * 3)
  })

  return <group ref={groupRef} />
```

The `scale={0.5}` prop is removed from the `<group>` because `useFrame` now owns the scale; leaving both would multiply them.

- [ ] **Step 4: Typecheck, lint, observe**

```bash
npx tsc --noEmit
npm run lint
```
To confirm the frameloop gate: open DevTools → Performance, record while scrolled to the contact section, and check that no WebGL draw calls appear. Simpler alternative — temporarily add `console.count('frame')` inside `useFrame`, scroll away, and confirm the count stops climbing. Remove the `console.count` before committing.

- [ ] **Step 5: Commit**

```bash
git add components/PyraminxCanvas.tsx components/PyraminxModel.tsx
git commit -m "perf(3d): add scene entrance and stop rendering when off-screen"
```

---

### Task 14: Full verification pass

**Files:** none created or modified unless a check fails.

- [ ] **Step 1: Production build**

```bash
npm run build
```
Expected: succeeds. `next-sitemap` runs as `postbuild` and must also succeed.

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Token discipline check**

```bash
# Numeric timing literals — `duration: duration.lg` is fine, `duration: 0.4` is not.
grep -rnE "duration:[[:space:]]*[0-9]|delay:[[:space:]]*[0-9]" components/ | grep -v "components/motion/"
grep -rn "staggerChildren\|delayChildren\|transitionDelay" components/ | grep -v "components/motion/"
# Off-scale CSS timings.
grep -rnE "duration-(75|100|150|200|1000)|ease-(out|in|in-out|linear)" components/
```
Expected: all three print nothing, with one allowed exception — the `useSpring` config on `scrollYProgress` in `components/Hero.tsx` (`stiffness: 120, damping: 30, mass: 0.6`). It is a spring, not a duration, and is tuned to the scroll distance rather than to the entrance scale. If anything else appears, move the value into `lib/motion.ts`.

```bash
grep -rn "react-simple-typewriter" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```
Expected: nothing.

- [ ] **Step 4: Responsive pass**

At 390px, 768px, and 1440px, scroll the full page and confirm at each width:
- `document.documentElement.scrollWidth === document.documentElement.clientWidth` in the console.
- The header pill does not overlap the hero headline.
- The skills grid collapses to one column below `md`.
- No card or image overflows its container.

- [ ] **Step 5: Reduced-motion pass**

Enable the OS reduce-motion setting (macOS: System Settings → Accessibility → Display → Reduce motion), hard-reload, and confirm:
- The hero headline appears without rising.
- Skill rows and experience cards appear without vertical travel.
- The CTA does not follow the cursor.
- The pyraminx does not idle-rotate or tilt.

- [ ] **Step 6: Keyboard pass**

Tab through the entire page. Every link — three in the header, the "Selected work" anchor, the GitHub CTA, the three contact rows — must show the accent focus ring, and focus order must follow visual order.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix(ui): verification pass corrections"
```
If nothing needed fixing, skip this step rather than making an empty commit.
