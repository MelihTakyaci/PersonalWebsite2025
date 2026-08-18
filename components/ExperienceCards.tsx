'use client'

import Image from 'next/image'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'

const projects = [
  {
    title: 'Kindle Style Mobile App',
    role: 'Full-Stack Developer',
    period: '2025',
    image: '/Experience/Mobile.PNG',
  },
  {
    title: 'E-commerce Platform with CMS',
    role: 'Full-Stack Developer',
    period: '2024',
    image: '/Experience/ecommerce.png',
  },
  {
    title: 'Marketing Website',
    role: 'UI Developer',
    period: '2025',
    image: '/Experience/Destani.png',
  },
  {
    title: 'NGO Website',
    role: 'Full-Stack Developer',
    period: '2024',
    image: '/Experience/KotgepWeb.png',
  },
]

export default function ExperienceCards() {
  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {projects.map((project, index) => (
        <StaggerItem
          as="article"
          key={project.title}
          className="surface group rounded-panel p-3"
        >
          <div className="aspect-video overflow-hidden rounded-card bg-ink-2 p-4">
            <Image
              src={project.image}
              alt={`${project.title} — ${project.role} project screenshot`}
              width={800}
              height={450}
              sizes="(max-width: 640px) 100vw, 50vw"
              priority={index < 2}
              className="h-full w-full rounded-sm2 object-contain transition-transform
                duration-700 ease-enter group-hover:scale-[1.04]"
            />
          </div>

          <div className="flex items-baseline justify-between gap-4 px-3 pb-2 pt-5">
            <div>
              <h3 className="text-h2 font-medium text-fg-1">{project.title}</h3>
              <p className="mt-1 text-body text-fg-2">{project.role}</p>
            </div>
            <span className="font-mono text-label uppercase text-fg-3">
              {project.period}
            </span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
