'use client';

import { useEffect, useState } from 'react';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';
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
          ? 'fixed top-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-xl shadow-lg'
          : 'mt-4'
      }`}
    >
      <div className="max-w-7xl mx-auto rounded-2xl bg-neutral-900/70 backdrop-blur-md px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="text-xs sm:text-sm tracking-wider font-semibold text-neutral-400 uppercase">
          Melih Takyaci
        </div>

        <div className="flex gap-3 text-neutral-500">
          <a
            href="https://www.linkedin.com/in/rockyhchen/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href="mailto:rockyhchen@gmail.com"
            className="hover:text-red-400 transition"
          >
            <FaEnvelope size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}