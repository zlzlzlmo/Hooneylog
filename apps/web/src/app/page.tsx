import { getAllPosts } from '@/lib/notion';
import { getGlobalStats, getViewCounts } from '@/lib/views';
import { HomePageClient } from './home-page-client';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const posts = await getAllPosts();
  
  const [stats, viewsMap] = await Promise.all([
    getGlobalStats(),
    getViewCounts(posts.map(p => p.id))
  ]);

  return <HomePageClient initialPosts={posts} stats={stats} viewsMap={viewsMap} />;
}
