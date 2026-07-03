import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const blogPosts = posts.map((post) => ({
    url: `https://hooneylog.com/post/${post.id}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Tag hubs are statically generated and indexable, so surface them too.
  const tagNames = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tagNames.add(tag.name);
  }
  const tagPages = Array.from(tagNames).map((name) => ({
    url: `https://hooneylog.com/tag/${encodeURIComponent(name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: 'https://hooneylog.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogPosts,
    ...tagPages,
  ];
}
