import { getAllPosts } from '@/lib/notion';
import { getGlobalStats, getViewCounts } from '@/lib/views';
import { HomePageClient } from './home-page-client';

// Hourly ISR; Notion data is Data-Cached for the same window and invalidated
// on-demand via /api/revalidate, so a tighter interval would only add render
// churn without surfacing fresher content.
export const revalidate = 3600;

export default async function Home() {
  const posts = await getAllPosts();
  
  const [stats, viewsMap] = await Promise.all([
    getGlobalStats(),
    getViewCounts(posts.map(p => p.id))
  ]);

  return <HomePageClient initialPosts={posts} stats={stats} viewsMap={viewsMap} />;
}
