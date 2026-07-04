import { getAllPosts } from '@/lib/notion';
import { getGlobalStats, getViewCounts } from '@/lib/views';
import { ALL } from '@/utils/category';
import { HomePageClient } from './home-page-client';

// Hourly ISR; Notion data is Data-Cached for the same window and invalidated
// on-demand via /api/revalidate, so a tighter interval would only add render
// churn without surfacing fresher content.
export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const posts = await getAllPosts();

  const [stats, viewsMap, { category }] = await Promise.all([
    getGlobalStats(),
    getViewCounts(posts.map(p => p.id)),
    searchParams,
  ]);

  // The header category nav links here with ?category=<name>. Only seed a real
  // category (one that actually exists on a post); anything else falls back to
  // 전체 so an unknown param never lands on an empty list.
  const knownCategories = new Set(posts.map(p => p.category).filter(Boolean));
  const initialCategory = category && knownCategories.has(category) ? category : ALL;

  return (
    <HomePageClient
      initialPosts={posts}
      stats={stats}
      viewsMap={viewsMap}
      initialCategory={initialCategory}
    />
  );
}
