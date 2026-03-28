import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const blogPosts = posts.map((post) => ({
    url: `https://www.hooneylog.com/post/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://www.hooneylog.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogPosts,
  ];
}
