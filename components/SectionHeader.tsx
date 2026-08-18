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
