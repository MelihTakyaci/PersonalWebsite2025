'use client';

import { useState } from 'react';
import { Header, Carousel, ExperienceCards, ContactSection, GitHubCTA } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import PyraminxCanvas from '@/components/PyraminxCanvas';


export default function Home() {
  const [flipped, setFlipped] = useState(false);


  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white font-sans px-4 sm:px-6 md:px-12 py-10">
      <Header />
        <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:mt-20 mt-4">
      {/* Text */}
        <section className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
          <motion.h1 className="text-4xl sm:text-5xl font-extrabold flex justify-center lg:justify-start items-center gap-3 md:mt-0 mt-4">
            I&apos;m Melih
            <motion.div
              className="relative w-12 h-12 perspective-1000 overflow-hidden"
              onMouseEnter={() => setFlipped(true)}
              onMouseLeave={() => setFlipped(false)}
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

          <motion.p className="text-lg sm:text-xl text-neutral-400 max-w-xl mx-auto lg:mx-0 break-words">
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
          w-full              /* mobil */
          h-full
          min-h-full
          canvas-wrapper
          sm:w-3/4
          md:w-2/3
          lg:w-1/2            /* desktop eşit kolon */
          aspect-square       /* daima kare */
          max-w-[400px]       /* 2K ekranda çok büyümesin */
          mx-auto             /* mobilde ortala */
          lg:mx-0             /* desktopta sola it */
          relative
          overflow-hidden
          pointer-events-none /* istersen interaction => auto */
          z-0
        "
        style={{
          isolation: 'isolate',
          willChange: 'transform',
        }}
      >
        <PyraminxCanvas />
      </div>
      </section>
      <section className="mt-16 sm:mt-24">
        <Carousel />
      </section>

      <section className="mt-20 sm:mt-32">
        <ExperienceCards />
      </section>
      <section className="mt-10 sm:mt-16">
        <GitHubCTA />
      </section>
      <ContactSection />
    </main>
  );
}