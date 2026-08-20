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

  // Baseline security headers. No CSP yet: the theme bootstrap in the root layout
  // is an inline script, so a real policy needs nonce plumbing first.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The blog embeds iframes (giscus); nothing needs to embed the blog.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
