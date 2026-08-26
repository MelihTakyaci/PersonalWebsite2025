// lib/structured-data.ts
// The schema.org graph describing who this site is about.
//
// One @graph rather than several loose blocks: the works reference the person
// by @id, so a consumer reads "these papers were written by this ORCID" instead
// of finding a person and some articles that merely share a page. That link is
// what lets an assistant answer "who is Melih Takyaci" with something it can
// check against Crossref, ORCID and Google Scholar.

import {
  AFFILIATION,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  ORCID,
  ORCID_URL,
  SCHOLAR_URL,
  publications,
  researchAreas,
  type Publication,
} from './publications'

const SCHEMA_TYPE: Record<Publication['type'], string> = {
  article: 'ScholarlyArticle',
  chapter: 'Chapter',
  conference: 'ScholarlyArticle',
}

export function buildGraph(siteUrl: string) {
  const personId = `${siteUrl}/#person`

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Melih Takyacı',
    // Both spellings are in use — the CV and publications carry the dotted
    // form, most links and handles the undotted one. Declaring both keeps a
    // search for either from resolving to a different entity.
    alternateName: ['Melih Takyaci', 'Melih Takyacı', 'M. Takyaci'],
    url: siteUrl,
    image: `${siteUrl}/default.png`,
    email: EMAIL,
    jobTitle: 'Computer Science Researcher & Full-Stack Developer',
    description:
      'Computer science researcher at Dokuz Eylul University working on health informatics, process mining and applied machine learning, with peer-reviewed publications in bibliometric analysis and AI in healthcare. Also builds full-stack web and mobile software.',
    // The strongest single signal here: a resolvable identifier that ties this
    // page to the same author record Crossref and Scholar already know.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'ORCID',
      value: ORCID,
      url: ORCID_URL,
    },
    sameAs: [ORCID_URL, SCHOLAR_URL, GITHUB_URL, LINKEDIN_URL, 'https://x.com/melihtakyaci'],
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: AFFILIATION.name,
      url: AFFILIATION.url,
      department: { '@type': 'Organization', name: AFFILIATION.department },
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: AFFILIATION.name,
      url: AFFILIATION.url,
    },
    knowsAbout: [
      ...researchAreas,
      'Next.js',
      'TypeScript',
      'React',
      'PostgreSQL',
      'Python',
      'PyTorch',
      'Docker',
      'Flutter',
    ],
    knowsLanguage: ['Turkish', 'English', 'Albanian'],
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'Undergraduate Researcher',
        occupationLocation: { '@type': 'Country', name: 'Türkiye' },
        skills:
          'Health informatics, bibliometric analysis, scientific mapping, machine learning, medical image analysis',
      },
      {
        '@type': 'Occupation',
        name: 'Institutional Data Analytics Intern',
        occupationLocation: { '@type': 'Country', name: 'Türkiye' },
        skills: 'Data integration, record linkage, data quality analysis, PostgreSQL, business intelligence',
      },
    ],
  }

  const works = publications.map((p) => ({
    '@type': SCHEMA_TYPE[p.type],
    '@id': p.doi ? `https://doi.org/${p.doi}` : `${siteUrl}/#work-${slug(p.title)}`,
    headline: p.title,
    name: p.title,
    author: [
      { '@id': personId },
      ...p.authors
        .filter((a) => !a.includes('Takyaci'))
        .map((a) => ({ '@type': 'Person', name: a })),
    ],
    datePublished: String(p.year),
    inLanguage: /[çğıöşüÇĞİÖŞÜ]/.test(p.title) ? 'tr' : 'en',
    isPartOf: { '@type': 'Periodical', name: p.venue },
    ...(p.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi } } : {}),
    ...(p.url ? { url: p.url } : {}),
  }))

  const website = {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Melih Takyaci',
    inLanguage: 'en',
    about: { '@id': personId },
    publisher: { '@id': personId },
  }

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/#profile`,
    url: siteUrl,
    mainEntity: { '@id': personId },
    isPartOf: { '@id': `${siteUrl}/#website` },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [person, website, profilePage, ...works],
  }
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}
