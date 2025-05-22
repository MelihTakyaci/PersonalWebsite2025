"use client";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

export default function GitHubCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16 sm:mt-24 px-6 flex justify-center"
    >
      <motion.a
        href="https://github.com/MelihTakyaci"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{
          scale: 1.05,
          y: -4,
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.4)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 transition-all duration-300 shadow-lg backdrop-blur-md"
      >
        <motion.div
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <FaGithub className="text-white text-2xl" />
        </motion.div>
        <motion.span
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.125 }}
          className="text-white text-lg font-medium"
        >
          See more on GitHub
        </motion.span>


      </motion.a>
    </motion.div>
  );
}