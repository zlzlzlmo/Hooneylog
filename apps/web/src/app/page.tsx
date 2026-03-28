import { getAllPosts } from '@/lib/notion';
import { getGlobalStats } from '@/lib/views';
import { HomePageClient } from './home-page-client';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const [posts, stats] = await Promise.all([
    getAllPosts(),
    getGlobalStats()
  ]);

  return <HomePageClient initialPosts={posts} stats={stats} />;
}
