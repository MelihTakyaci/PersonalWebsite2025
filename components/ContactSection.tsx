'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ContactSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24 px-4 sm:px-8 flex flex-col items-center text-center"
    >
      <div className="text-3xl sm:text-5xl font-semibold text-white mb-6 flex items-center gap-3">
        <Image src="/default.png" height={500} width={500} alt="No" className='w-20' />
        <span>get in touch</span>
      </div>

      <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-8">
        Always open to exciting ideas, freelance collaborations, or just geeking out over tech ☕
      </p>

      <div className="space-y-3 text-sm sm:text-base text-neutral-300">
        <p>
          📧 <a
            href="mailto:melih.takyaci@gmail.com"
            className="underline underline-offset-4 hover:text-blue-400 transition"
          >
            melih.takyaci@gmail.com
          </a>
        </p>
        <p>
          💼 <a
            href="https://www.linkedin.com/in/melihtakyaci"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-blue-400 transition"
          >
            linkedin.com/in/melihtakyaci
          </a>
        </p>
        <p>
          💻 <a
            href="https://github.com/MelihTakyaci"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-purple-400 transition"
          >
            github.com/MelihTakyaci
          </a>
        </p>
      </div>
    </motion.section>
  );
}