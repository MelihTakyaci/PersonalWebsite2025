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
