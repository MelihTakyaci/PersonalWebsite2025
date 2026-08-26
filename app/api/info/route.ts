import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
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
} from "@/lib/publications";

/**
 * A machine-readable card for agents that prefer JSON to scraping. Reads the
 * same source as the page and llms.txt, so the three cannot disagree.
 */
export async function GET() {
  return NextResponse.json({
    name: "Melih Takyaci",
    alternateNames: ["Melih Takyacı", "M. Takyaci"],
    orcid: ORCID,
    orcidUrl: ORCID_URL,
    title: "Computer Science Researcher & Full-Stack Developer",
    affiliation: {
      name: AFFILIATION.name,
      department: AFFILIATION.department,
      url: AFFILIATION.url,
    },
    website: siteUrl,
    researchAreas,
    publications: publications.map((p) => ({
      title: p.title,
      authors: p.authors,
      year: p.year,
      venue: p.venue,
      type: p.type,
      doi: p.doi ?? null,
      url: p.url ?? null,
    })),
    projects: [
      {
        name: "TEKNOFEST Artificial Intelligence in Healthcare",
        year: 2026,
        status: "Semi-finalist",
        description:
          "AI-based healthcare system: medical data processing, predictive modelling and interpretable clinical decision support.",
      },
      {
        name: "TÜBİTAK 2209-A Undergraduate Research Project",
        year: 2026,
        status: "Accepted, in progress",
        description:
          "LLM-supported system for cancer-related information processing, patient interaction and decision-support workflows.",
      },
    ],
    topics: [
      "Health Informatics",
      "Process Mining",
      "Bibliometric Analysis",
      "Machine Learning",
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Python",
      "Docker",
    ],
    profiles: {
      scholar: SCHOLAR_URL,
      github: GITHUB_URL,
      linkedin: LINKEDIN_URL,
    },
    contact: EMAIL,
    updatedAt: new Date().toISOString().slice(0, 10),
  });
}
