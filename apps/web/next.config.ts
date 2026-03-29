import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limit concurrency to avoid Notion API rate limits during SSG build
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
