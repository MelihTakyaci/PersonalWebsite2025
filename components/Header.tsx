'use client';

import { useEffect, useState } from 'react';
import { FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'fixed top-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-xl shadow-md'
          : 'mt-4'
      }`}
    >
      <div className="max-w-7xl mx-auto rounded-2xl bg-neutral-900/70 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center">
        {/* Logo or Name */}
        <div className="text-sm sm:text-base tracking-wider font-semibold text-neutral-300 uppercase">
          Melih Takyaci
        </div>

        {/* Social Icons */}
        <div className="flex gap-2 sm:gap-4 text-neutral-400 text-xl sm:text-base">
          <a
            href="https://linkedin.com/in/melih-takyaci"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-1 hover:text-blue-400 transition"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com/MelihTakyaci"
            className="p-2 sm:p-1 hover:text-white transition"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="mailto:melihtakyaci@gmail.com"
            className="p-2 sm:p-1 hover:text-red-400 transition"
          >
            <FaEnvelope size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}