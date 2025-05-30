'use client';
import { useState, useEffect, useRef, useMemo } from 'react';

// -----------------------------------------------------------------------------
//  Skill data (could come from a CMS or i18n JSON later)
// -----------------------------------------------------------------------------
const rawSkills = [
  {
    title: 'Full Stack Web Developer',
    description:
      'I build modern, scalable applications using Next.js, Nest.js, MongoDB, Redis, PostgreSQL and Docker. I enjoy crafting full-stack solutions from scratch.',
    emoji: '🌐',
  },
  {
    title: 'Embedded Systems Enthusiast',
    description:
      'As a hobbyist, I develop bare-metal applications with STM32, Arduino, and ESP32 using C/C++. I love the challenge of low-level control.',
    emoji: '⚙️',
  },
  {
    title: 'AI & Computer Vision',
    description:
      "I'm exploring AI with YOLOv11n, OpenCV, Pandas, and TimescaleDB to build smart systems and meaningful visualizations from real-world data.",
    emoji: '🧠',
  },
  {
    title: 'DevOps & Engineering Workflow',
    description:
      'I manage CI/CD pipelines, Docker containers, GitHub Actions, and monorepo structures for streamlined and automated development workflows.',
    emoji: '🚀',
  },
];

// -----------------------------------------------------------------------------
//  Helper hooks
// -----------------------------------------------------------------------------
/**
 * Detects whether the current user has asked for reduced motion in OS settings.
 */
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Sets true once the referenced element enters the viewport.
 */
function useIsInViewport(ref, rootMargin = '0px 0px -20% 0px') {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // run once
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

// -----------------------------------------------------------------------------
//  Component
// -----------------------------------------------------------------------------
export default function SkillShowcase() {
  // Memoise so React key stability is kept even if order changes later
  const skills = useMemo(() => rawSkills, []);

  const sectionRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isVisible = useIsInViewport(sectionRef);

  // When user prefers reduced motion, skip animations entirely
  const animate = isVisible && !prefersReducedMotion;

  return (
    <section ref={sectionRef} className="w-full py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ---------------- MOBILE CAROUSEL ---------------- */}
        <ul
          role="list"
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide sm:hidden pb-4"
        >
          {skills.map((skill, index) => (
            <li
              key={skill.title}
              tabIndex={0}
              className={`snap-center flex-shrink-0 w-72 bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <span role="img" aria-label={`${skill.title} icon`} className="text-3xl mb-4 inline-block">
                {skill.emoji}
              </span>
              <h3 className="text-lg font-medium text-white mb-3">{skill.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{skill.description}</p>
            </li>
          ))}
        </ul>

        {/* ---------------- DESKTOP GRID ---------------- */}
        <ul role="list" className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill, index) => (
            <li
              key={skill.title}
              tabIndex={0}
              className={`group relative bg-neutral-900/30 border border-neutral-800/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:bg-neutral-900/50 hover:border-neutral-700/50 hover:scale-[1.02] ${
                animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Shine sweep */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </div>

              <div className="relative z-10">
                <span
                  role="img"
                  aria-label={`${skill.title} icon`}
                  className={`text-3xl mb-4 inline-block transition-all duration-500 group-hover:scale-110 ${
                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 200 + 100}ms` }}
                >
                  {skill.emoji}
                </span>
                <h3
                  className={`text-lg font-medium text-white mb-3 transition-all duration-500 ${
                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 200 + 200}ms` }}
                >
                  {skill.title}
                </h3>
                <p
                  className={`text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-all duration-500 ${
                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 200 + 300}ms` }}
                >
                  {skill.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Hide default scrollbars on WebKit / Firefox */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
