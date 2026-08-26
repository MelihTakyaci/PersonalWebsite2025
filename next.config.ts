import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next infers the workspace root from the nearest lockfile and walks upward,
  // which picks up unrelated lockfiles sitting in a developer's home directory
  // and traces the wrong tree into the serverless output. This project is its
  // own root, so say so rather than leaving it to inference.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
