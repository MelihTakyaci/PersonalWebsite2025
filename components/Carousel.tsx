'use client'

import SectionHeader from '@/components/SectionHeader'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { FocusRail, FocusRailItem } from '@/components/motion/FocusRail'

const skills = [
  {
    title: 'AI & Machine Learning',
    description:
      'PyTorch, TensorFlow, YOLOv11n and OpenCV — healthcare risk modelling, medical image analysis and interpretable prediction.',
  },
  {
    title: 'Academic Writing & Publishing',
    description:
      'Peer-reviewed journal articles, conference papers and book chapters — bibliometric analysis and scientific mapping in R, Bibliometrix and VOSviewer, from literature synthesis through to the finished manuscript.',
  },
  {
    title: 'Data Engineering & Analytics',
    description:
      'Scopus-scale institutional datasets in Python, R and PostgreSQL — record linkage, author matching and data-quality analysis, reproducible from raw export to Metabase dashboard.',
  },
  {
    title: 'Full-Stack & Mobile Development',
    description:
      'Modern, scalable applications with Next.js, Nest.js, MongoDB, Redis, PostgreSQL and Docker — and cross-platform mobile in Flutter and Swift, shipped through TestFlight.',
  },
  {
    title: 'Embedded Systems',
    description:
      'Bare-metal applications on STM32, Arduino and ESP32 in C/C++, where the constraint is the interesting part.',
  },
  {
    title: 'DevOps & Workflow',
    description:
      'CI/CD pipelines, Docker containers on Linux, GitHub Actions and monorepo structures that keep delivery boring.',
  },
]

/**
 * The heading lives inside the pin rather than in page.tsx, unlike the other
 * sections: were it left outside it would scroll away before the rail engages,
 * leaving three screens of capabilities with nothing naming them.
 */
export default function SkillShowcase() {
  return (
    <FocusRail count={skills.length} className="relative md:min-h-[400vh]">
      <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center">
        <SectionHeader
          index="01"
          label="Capabilities"
          title="What I work on"
          id="skills-title"
        />

        <Stagger as="ul" className="border-b border-line">
          {skills.map((skill, index) => (
            <StaggerItem
              as="li"
              key={skill.title}
              className="group border-t border-line transition-colors duration-300
                hover:bg-ink-1/50 [perspective:800px]"
            >
              <FocusRailItem
                index={index}
                className="grid grid-cols-1 gap-3 px-2 py-8 md:grid-cols-12 md:gap-8 md:px-4"
              >
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
              </FocusRailItem>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </FocusRail>
  )
}
