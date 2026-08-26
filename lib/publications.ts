// lib/publications.ts
// The single source for identity and published work. The JSON-LD graph, the
// llms.txt route, /api/info and the visible list all read from here, so a
// citation can never drift between what a crawler sees and what a reader does.
//
// Published work only. Manuscripts that are accepted, awaiting publication or
// unsubmitted are deliberately absent: an entry a verifier cannot resolve
// against Crossref or the publisher weakens confidence in every other claim on
// the page.

export const ORCID = '0009-0008-5987-5924'
export const ORCID_URL = `https://orcid.org/${ORCID}`
export const SCHOLAR_URL = 'https://scholar.google.com/citations?user=XFKVJ54AAAAJ'
export const GITHUB_URL = 'https://github.com/MelihTakyaci'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/melihtakyaci/'
export const EMAIL = 'melihtakyaci@gmail.com'

export const AFFILIATION = {
  name: 'Dokuz Eylul University',
  url: 'https://www.deu.edu.tr/',
  department: 'Department of Computer Science',
} as const

export type PublicationType = 'article' | 'chapter' | 'conference'

export interface Publication {
  title: string
  authors: string[]
  year: number
  /** Journal, proceedings or book the work appears in. */
  venue: string
  /** Volume/issue/pages, when the record has them. */
  detail?: string
  type: PublicationType
  /** Bare DOI, where one was assigned. */
  doi?: string
  /** Canonical landing page, where the record has one. Absent for works that
   *  are in print without a resolvable page — better no link than a wrong one. */
  url?: string
}

export const publications: Publication[] = [
  {
    title:
      'An Evaluation of Open Data Sources in the Health Sector in Türkiye and Around the World and Data Quality Analysis in Open Data Sources Using Business Intelligence Applications',
    authors: [
      'Melih Takyaci',
      'N. C. Genek',
      'A. Güzel',
      'M. A. Aydın',
      'S. Özkök',
      'H. B. Taş',
      'S. S. Sungur',
    ],
    year: 2026,
    venue: 'Journal of Emerging Computer Technologies',
    detail: 'pp. 44–76',
    type: 'article',
    url: 'https://dergipark.org.tr/en/pub/ject/article/1906131',
  },
  {
    title:
      'Global Research Trends for Platelet-Rich Plasma: A Science Mapping with Machine Learning Techniques',
    authors: ['T. Küme', 'M. Damar', 'M. Çetinkaya', 'Melih Takyaci', 'M. A. Aydın'],
    year: 2025,
    venue: 'Journal of AI',
    detail: '9(1), 80–97',
    type: 'article',
    doi: '10.61969/jai.1819178',
    url: 'https://doi.org/10.61969/jai.1819178',
  },
  {
    title:
      "Dokuz Eylül Temel Bilgisayar Bilimleri Araştırma Alanında Azerbaycan'ın Bilimsel Üretkenlik Açısından Durumunun Değerlendirilmesi ve Daha İyisi İçin Öneriler",
    authors: [
      'E. Nasiboğlu',
      'M. Damar',
      'F. Nuriyeva',
      'S. Özkök',
      'M. A. Aydın',
      'Melih Takyaci',
    ],
    year: 2025,
    venue: 'İzmir Journal of Social Sciences',
    detail: '7(2), 208–237',
    type: 'article',
    doi: '10.47899/ijss.1820174',
    url: 'https://doi.org/10.47899/ijss.1820174',
  },
  {
    title:
      'Research Trends and Thematic Insights from the Most Cited Cybernetics Studies in the Last Ten Years Using Text Mining and Bibliometric Analysis',
    authors: [
      'M. Damar',
      'M. A. Aydın',
      'Melih Takyaci',
      'S. Özkök',
      'E. Nasiboğlu',
      'Ö. Aydın',
    ],
    year: 2025,
    venue:
      'Proceedings of the 6th International Conference on Problems of Cybernetics and Informatics',
    type: 'conference',
  },
  {
    title:
      'Generative Artificial Intelligence Applications in Digital Media: The Role and Transformative Impact of Large Language Models',
    authors: [
      'Melih Takyaci',
      'N. C. Genek',
      'B. Taş',
      'S. E. Alkan',
      'A. Gür',
      'M. Damar',
    ],
    year: 2025,
    venue: 'The Age of Generative Artificial Intelligence (İzmir Akademi Derneği)',
    type: 'chapter',
    doi: '10.5281/zenodo.16009155',
    url: 'https://doi.org/10.5281/zenodo.16009155',
  },
]

/** Research areas, taken from the CV rather than from aspiration. */
export const researchAreas = [
  'Health Informatics',
  'Process Mining',
  'Bibliometric Analysis',
  'Scientific Mapping',
  'Institutional Data Analytics',
  'Machine Learning',
  'Explainable Artificial Intelligence',
  'Medical Image Analysis',
  'Business Process Management',
  'Event Data Analytics',
  'Data Science',
]

/** Formats one entry the way a citation would read. */
export function formatCitation(p: Publication): string {
  const authors = p.authors.join(', ')
  const detail = p.detail ? `, ${p.detail}` : ''
  return `${authors} (${p.year}). ${p.title}. ${p.venue}${detail}.`
}
