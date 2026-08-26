// app/page.tsx
import {
  Header,
  Hero,
  Carousel,
  ExperienceCards,
  ContactSection,
  GitHubCTA,
  ScholarLink,
  Publications,
} from '@/components'
import SectionHeader from '@/components/SectionHeader'
import BackgroundFX from '@/components/BackgroundFX'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <BackgroundFX />
      <Header />
      <ScholarLink />
      <Hero />

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {/* This section's heading is rendered by Carousel, inside the pinned
            rail — see the note there. */}
        <section id="projects" aria-labelledby="skills-title" className="pt-28 sm:pt-40">
          <Carousel />
        </section>

        <section id="research" aria-labelledby="research-title" className="pt-28 sm:pt-40">
          <SectionHeader index="02" label="Research" title="Published work" id="research-title" />
          <Publications />
        </section>

        <section id="experience" aria-labelledby="experience-title" className="pt-28 sm:pt-40">
          <SectionHeader index="03" label="Experience" title="Selected work" id="experience-title" />
          <ExperienceCards />
        </section>

        <section id="github" aria-labelledby="github-title" className="pt-28 sm:pt-40">
          <h2 id="github-title" className="sr-only">GitHub Highlights</h2>
          <GitHubCTA />
        </section>

        <section id="contact" aria-labelledby="contact-title" className="pt-28 sm:pt-40 pb-32">
          <SectionHeader index="04" label="Contact" title="Get in touch" id="contact-title" />
          <ContactSection />
        </section>
      </div>
    </main>
  )
}
