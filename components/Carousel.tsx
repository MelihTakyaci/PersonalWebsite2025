'use client'

import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const skills = [
  {
    title: 'Full-Stack Web Development',
    description:
      'Modern, scalable applications with Next.js, Nest.js, MongoDB, Redis, PostgreSQL and Docker — from schema to deployment.',
  },
  {
    title: 'Embedded Systems',
    description:
      'Bare-metal applications on STM32, Arduino and ESP32 in C/C++, where the constraint is the interesting part.',
  },
  {
    title: 'AI & Computer Vision',
    description:
      'YOLOv11n, OpenCV, Pandas and TimescaleDB, turning real-world sensor data into systems that decide.',
  },
  {
    title: 'DevOps & Workflow',
    description:
      'CI/CD pipelines, Docker containers, GitHub Actions and monorepo structures that keep delivery boring.',
  },
]

export default function SkillShowcase() {
  return (
    <Stagger as="ul" className="border-b border-line">
      {skills.map((skill, index) => (
        <StaggerItem
          as="li"
          key={skill.title}
          className="group border-t border-line transition-colors duration-300 hover:bg-ink-1/50"
        >
          <div className="grid grid-cols-1 gap-3 px-2 py-8 md:grid-cols-12 md:gap-8 md:px-4">
            <span className="font-mono text-label uppercase text-fg-3 md:col-span-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3
              className="text-h2 font-medium text-fg-1 transition-transform duration-500
                ease-enter md:col-span-4 md:group-hover:translate-x-1"
            >
              {skill.title}
            </h3>
            <p className="text-body text-fg-2 md:col-span-7">{skill.description}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
