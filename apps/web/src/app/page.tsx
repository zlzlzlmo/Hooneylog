import { getAllPosts } from '@/lib/notion';
import { HomePageClient } from './HomePageClient';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const posts = await getAllPosts();

  return <HomePageClient initialPosts={posts} />;
}
