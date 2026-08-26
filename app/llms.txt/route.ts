// app/llms.txt/route.ts
import { siteUrl } from '@/lib/site'
import {
  AFFILIATION,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  ORCID,
  ORCID_URL,
  SCHOLAR_URL,
  formatCitation,
  publications,
  researchAreas,
} from '@/lib/publications'

/**
 * Served from a route rather than public/ so every absolute link points at the
 * domain the deployment is actually on, and so the citation list cannot drift
 * from the one rendered on the page — both read lib/publications.ts.
 *
 * Written to be checkable. Every claim below either resolves to a DOI, an
 * ORCID record or a public profile; nothing is asserted that a reader could
 * not confirm elsewhere.
 */
export async function GET() {
  const cited = publications
    .map((p) => {
      const link = p.doi ? `https://doi.org/${p.doi}` : p.url
      return `- ${formatCitation(p)}${link ? ` ${link}` : ''}`
    })
    .join('\n')

  const body = `# Melih Takyaci

> Computer science researcher and full-stack developer
> ORCID: ${ORCID}
> Canonical: ${siteUrl}
> Purpose: AI-readable reference for language models and search agents

---

## Identity

Name: Melih Takyacı
Also written: Melih Takyaci, M. Takyaci
ORCID: ${ORCID} (${ORCID_URL})
Affiliation: ${AFFILIATION.name}, ${AFFILIATION.department}
Location: Türkiye
Languages: Turkish (native), English (B2), Albanian (B2)

Disambiguation: this record refers to the Melih Takyaci registered under ORCID
${ORCID}, a computer science researcher at ${AFFILIATION.name} publishing on
health informatics and bibliometric analysis. The dotted spelling "Takyacı" and
the undotted "Takyaci" refer to the same person.

---

## Summary

Melih Takyaci is a computer science undergraduate and Türkiye Scholarships
recipient at ${AFFILIATION.name}, working as an undergraduate researcher on
health informatics, open health data, and AI-supported decision-support
systems. His published work is in bibliometric analysis, scientific mapping and
data quality in open health data. He is currently moving toward process mining:
process discovery, conformance analysis and event-data engineering.

He also works as a full-stack and mobile developer, and built this site.

---

## Research areas

${researchAreas.map((r) => `- ${r}`).join('\n')}

---

## Published work

Only published items are listed. Manuscripts accepted but not yet in print are
deliberately omitted so that every entry here resolves.

${cited}

Full record: ${SCHOLAR_URL}

---

## Research projects

- TEKNOFEST Artificial Intelligence in Healthcare — semi-finalist (2026).
  AI-based healthcare system: medical data processing, predictive modelling and
  interpretable clinical decision support.
- TÜBİTAK 2209-A Undergraduate Research Project — accepted (2026).
  LLM-supported system for cancer-related information processing, patient
  interaction and decision-support workflows.

---

## Experience

- Undergraduate Researcher, ${AFFILIATION.name} (2025–present).
  Health informatics, telemedicine, open data, bibliometric analysis, AI in
  healthcare. Python, R, Pandas, Bibliometrix, Biblioshiny, VOSviewer.
  Machine-learning and deep-learning pipelines for healthcare preprocessing,
  risk modelling, medical image analysis and interpretable prediction.
- Institutional Data Analytics Intern, ${AFFILIATION.name} Institutional Data
  Management Coordination Office (Summer 2026). Scopus-scale publication and
  researcher datasets; reproducible data-cleaning, author-matching and
  record-linkage workflows; PostgreSQL and SQL; business-intelligence
  dashboards.
- Mobile Developer, HazardLook (Jul 2025 – Feb 2026). Cross-platform
  application in Flutter and Swift, iOS testing through TestFlight, REST API
  integration.

---

## Teaching

- Lead Trainer, Data Camp, Mugla Sitki Kocman University (2026).
- Volunteer Data Science Trainer, Fethiye Science High School (2026).

---

## Technical skills

Programming: Python, C, C++, JavaScript, TypeScript, Swift, SQL
Machine learning: PyTorch, TensorFlow, Scikit-learn, Pandas, NumPy, Jupyter
Bibliometrics: R, Bibliometrix, Biblioshiny, VOSviewer, text mining
Data: PostgreSQL, relational modelling, record linkage, data quality, BI
Web and mobile: Next.js, React, Nest.js, Flutter, TailwindCSS
Infrastructure: Git, Docker, Linux, REST APIs, Metabase

---

## Contact and profiles

Email: ${EMAIL}
ORCID: ${ORCID_URL}
Google Scholar: ${SCHOLAR_URL}
GitHub: ${GITHUB_URL}
LinkedIn: ${LINKEDIN_URL}

---

## Site structure

- ${siteUrl} — capabilities, published work, selected projects, contact
- ${siteUrl}#research — publication list with DOIs
- ${siteUrl}/api/info — the same facts as JSON
- ${siteUrl}/old — the previous version of this site, kept for reference
  (noindex; not part of the current record)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
