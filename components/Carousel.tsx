'use client';

const skills = [
  {
    title: 'Full Stack Web',
    description:
      'I build scalable web architectures using Next.js, Fastify, PostgreSQL, Redis, and Docker.',
    emoji: '🌐',
  },
  {
    title: 'Embedded Systems',
    description:
      'I develop bare-metal STM32, Arduino, and ESP32 applications using C / C++.',
    emoji: '⚙️',
  },
  {
    title: 'AI & Data Projects',
    description:
      'I create visual analysis and data processing solutions using YOLOv11n, OpenCV, Pandas, and TimescaleDB.',
    emoji: '🧠',
  },
  {
    title: 'DevOps & Tooling',
    description:
      'I work with Docker, GitHub Actions, monorepo management, and CI/CD pipeline automation.',
    emoji: '🚀',
  },
];

export default function SkillShowcase() {
  return (
    <section className="w-full py-10 px-4 sm:px-8">
      {/* Mobile: horizontal scroll */}
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

      {/* Desktop: grid layout */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="text-4xl mb-4">{skill.emoji}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{skill.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{skill.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}