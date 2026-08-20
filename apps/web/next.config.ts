import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Explicit caching (`use cache` in lib/notion.ts) + PPR: the shell is prerendered
  // and only the request-time parts (view counts, search params) stream in.
  cacheComponents: true,

  // React Compiler handles memoization, so components stay free of hand-rolled
  // useMemo/useCallback scaffolding.
  reactCompiler: true,

  // Limit concurrency to avoid Notion API rate limits during SSG build
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
