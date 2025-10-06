// app/page.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Header,
  Carousel,
  ExperienceCards,
  ContactSection,
  GitHubCTA,
} from '@/components'
import { motion, AnimatePresence } from 'framer-motion'
import { Typewriter } from 'react-simple-typewriter'
import BackgroundFX from '@/components/BackgroundFX'

const PyraminxCanvas = dynamic(() => import('@/components/PyraminxCanvas'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const [flipped, setFlipped] = useState(false)

  return (
    <main className="relative min-h-screen text-white">
      <BackgroundFX />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10">
        <Header />

        {/* HERO */}
        <section
          className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:mt-20 mt-4"
          aria-labelledby="hero-title"
        >
          {/* Text */}
          <section className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
            <motion.h1
              id="hero-title"
              className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold flex justify-center lg:justify-start items-center gap-3 md:mt-0 mt-4 tracking-tight"
            >
              I&apos;m Melih
              <motion.div
                className="relative w-12 h-12 perspective-1000 overflow-hidden"
                onMouseEnter={() => setFlipped(true)}
                onMouseLeave={() => setFlipped(false)}
                aria-label={flipped ? "heart hands" : "peace sign"}
                role="img"
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={flipped ? 'back' : 'front'}
                    initial={{ rotateY: flipped ? 0 : 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: flipped ? -180 : 180, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-full h-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {flipped ? '🫶' : '✌️'}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.h1>

            <motion.p className="text-lg sm:text-xl text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              <Typewriter
                words={[
                  'I love coding 💻',
                  'Full-Stack Web Developer 🌐',
                  'Embedded Systems Enthusiast ⚙️',
                  'Building cool things with code 🚀',
                  'Always learning, always hacking 🧠',
                ]}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={60}
                deleteSpeed={40}
                delaySpeed={1500}
              />
            </motion.p>
          </section>

          {/* Canvas */}
          <div
            className="
              w-full h-full aspect-square max-w-[420px]
              sm:w-3/4 md:w-2/3 lg:w-1/2
              mx-auto lg:mx-0 relative
            "
            style={{ 
              height: '420px',
              minHeight: '300px',
              maxHeight: '520px',
              isolation: 'isolate',
              contain: 'layout style paint',
            }}
            aria-hidden="true"
          >
            <PyraminxCanvas />
          </div>
        </section>

        {/* Diğer bölümler */}
        <section className="mt-16 sm:mt-24" aria-labelledby="carousel-title">
          <h2 id="carousel-title" className="sr-only">Featured Projects</h2>
          <Carousel />
        </section>

        <section className="mt-20 sm:mt-32" aria-labelledby="experience-title">
          <h2 id="experience-title" className="sr-only">Experience</h2>
          <ExperienceCards />
        </section>

        <section className="mt-10 sm:mt-16" aria-labelledby="github-title">
          <h2 id="github-title" className="sr-only">GitHub Highlights</h2>
          <GitHubCTA />
        </section>

        <section aria-labelledby="contact-title">
          <h2 id="contact-title" className="sr-only">Contact</h2>
          <ContactSection />
        </section>
      </div>
    </main>
  )
}