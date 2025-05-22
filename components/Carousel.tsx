'use client';

const skills = [
  {
    title: 'Full Stack Web Developer',
    description:
      'I build modern, scalable applications using Next.js, Fastify, PostgreSQL, Redis, and Docker. I enjoy crafting full-stack solutions from scratch.',
    emoji: '🌐',
  },
  {
    title: 'Embedded Systems Enthusiast',
    description:
      'As a hobbyist, I develop bare-metal applications with STM32, Arduino, and ESP32 using C/C++. I love the challenge of low-level control.',
    emoji: '⚙️',
  },
  {
    title: 'AI & Visual Data Projects',
    description:
      'I’m exploring AI with YOLOv11n, OpenCV, Pandas, and TimescaleDB to build smart systems and meaningful visualizations from real-world data.',
    emoji: '🧠',
  },
  {
    title: 'DevOps & Engineering Workflow',
    description:
      'I manage CI/CD pipelines, Docker containers, GitHub Actions, and monorepo structures for streamlined and automated development workflows.',
    emoji: '🚀',
  },
];

export default function SkillShowcase() {
  return (
    <section className="w-full py-10 px-4 sm:px-8">
      {/* Mobile */}
      <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide sm:hidden">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="snap-center flex-shrink-0 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md"
          >
            <div className="text-4xl mb-4">{skill.emoji}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{skill.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{skill.description}</p>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="shine-parent relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md overflow-hidden hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="shine-effect absolute inset-0 pointer-events-none"></div>

            <div className="relative z-10 transition-transform duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4">{skill.emoji}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{skill.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{skill.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}