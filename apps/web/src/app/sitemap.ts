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
  // lastModified comes from the newest post carrying the tag rather than "now":
  // it is the honest value, and it keeps this route prerenderable.
  const tagUpdatedAt = new Map<string, string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const current = tagUpdatedAt.get(tag.name);
      if (!current || post.updatedAt > current) tagUpdatedAt.set(tag.name, post.updatedAt);
    }
  }
  const tagPages = Array.from(tagUpdatedAt.entries()).map(([name, updatedAt]) => ({
    url: `https://hooneylog.com/tag/${encodeURIComponent(name)}`,
    lastModified: new Date(updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: 'https://hooneylog.com',
      lastModified: new Date(posts[0]?.updatedAt ?? blogPosts[0]?.lastModified ?? 0),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogPosts,
    ...tagPages,
  ];
}
