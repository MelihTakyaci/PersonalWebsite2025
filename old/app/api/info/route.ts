import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Melih Takyacı",
    title: "Full-Stack & Embedded Systems Developer",
    website: "https://melihtakyaci.com",
    projects: [
      {
        name: "Acem Solutions",
        description: "AI-powered drone & risk analysis modules (FPV/ISR, CV, embedded)."
      },
      {
        name: "HazardLook",
        description: "Property risk analysis platform: maps, CV, open data, dashboards."
      }
    ],
    topics: [
      "Next.js","TypeScript","Fastify","PostgreSQL","RAG",
      "ESP32/STM32","OpenCV","YOLOv11n","Docker","Monorepo"
    ],
    contact: "contact@melihtakyaci.com",
    updatedAt: new Date().toISOString().slice(0,10)
  });
}