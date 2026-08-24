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
        // Explicit start values: the className sets neither, so framer-motion
        // would otherwise read `max-width: none` off the computed style and
        // refuse to animate it, leaving the condense transition to jump.
        initial={{ maxWidth: 1280, paddingLeft: 16, paddingRight: 16 }}
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
