import { ITag } from '@hooneylog/shared-types';

// Tech-specific cover images, keyed by normalized tag name.
// Categories were consolidated to Frontend/Backend/Artificial Intelligence,
// so the per-tech cover is now driven by tags (which retain the granularity).
const TAG_IMAGE_MAP: Record<string, string> = {
  css: '/images/css.png',
  html: '/images/html.png',
  javascript: '/images/javascript.png',
  nestjs: '/images/nestjs.png',
  'nest.js': '/images/nestjs.png',
  nextjs: '/images/nextjs.png',
  'next.js': '/images/nextjs.png',
  react: '/images/react.png',
  typescript: '/images/typescript.png',
  esbuild: '/images/esbuild.png',
  refactoring: '/images/refactoring.png',
  algorithm: '/images/알고리즘.png',
  optimization: '/images/최적화.png',
  performance: '/images/최적화.png',
};

const normalize = (s: string) => s.toLowerCase().trim();

/**
 * Resolves a cover image. Prefers a tech-specific image matched by tag,
 * then falls back to legacy category mapping, then to the default
 * (which renders as a generated gradient via CategoryFallbackImage).
 */
export function getCategoryImageSrc(category: string, tags: ITag[] = []): string {
  for (const tag of tags) {
    const hit = TAG_IMAGE_MAP[normalize(tag.name)];
    if (hit) return hit;
  }
  // Legacy fallback: some old data may still carry a tech category value.
  const legacy = TAG_IMAGE_MAP[normalize(category)];
  return legacy ?? '/images/default.png';
}
