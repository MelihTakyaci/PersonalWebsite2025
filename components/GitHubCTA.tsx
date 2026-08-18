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
