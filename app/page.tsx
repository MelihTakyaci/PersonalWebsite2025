'use client';

import { Header, Carousel, ExperienceCards, ContactSection } from '@/components';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white font-sans px-4 sm:px-6 md:px-12 py-10">
      <Header />

      <section className="mt-16 sm:mt-24 px-5">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          I&apos;m Melih ✌️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl mt-4 text-neutral-300 max-w-xl"
        >
          <Typewriter
            words={[
              'I love coding 💻',
              'Full-Stack Web Developer 🌐',
              'Embedded Systems Enthusiast ⚙️',
              'Building cool things with code 🚀',
              'Always learning, always hacking 🧠'
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

      <section className="mt-16 sm:mt-24">
        <Carousel />
      </section>

      <section className="mt-20 sm:mt-32">
        <ExperienceCards />
      </section>
      <ContactSection />
    </main>
  );
}