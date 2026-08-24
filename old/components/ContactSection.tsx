'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24 px-4 sm:px-8 flex flex-col items-center text-center"
    >
      <div
        className="text-3xl sm:text-5xl font-semibold text-white mb-6 flex items-center gap-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          className="relative w-20 h-20"
          animate={{ scale: hovered ? 1.05 : 1, rotate: hovered ? 5 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Base Image */}
          <Image
            src="/default.png"
            height={500} width={500}
            alt="Default Memoji"
            className={`rounded-full object-contain transition-opacity duration-500 w-20 ${hovered ? 'opacity-0' : 'opacity-100'}`}
          />
          {/* Hover Image */}
          <Image
            src="/dyes.png"
            height={500} width={500}
            alt="Hover Memoji"
            className={`rounded-full object-contain transition-opacity duration-500 absolute top-0 left-0 w-30 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </motion.div>
        <span>get in touch</span>
      </div>

      <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-8">
        Always open to exciting ideas, freelance collaborations, or just geeking out over tech ☕
      </p>

      <div className="space-y-3 text-sm sm:text-base text-neutral-300">
        <p>
          📧 <a
            href="mailto:melihtakyaci@gmail.com"
            className=" hover:text-blue-400 transition"
          >
            melihtakyaci@gmail.com
          </a>
        </p>
        <p>
          💼 <a
            href="https://linkedin.com/in/melih-takyaci"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            linkedin.com/in/melihtakyaci
          </a>
        </p>
        <p>
          💻 <a
            href="https://github.com/MelihTakyaci"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition"
          >
            github.com/MelihTakyaci
          </a>
        </p>
      </div>
    </motion.section>
  );
}