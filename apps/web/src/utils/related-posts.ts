import { NotionPost } from '@hooneylog/shared-types';

export function getRelatedPosts(all: NotionPost[], current: NotionPost, limit = 3): NotionPost[] {
  const currentTagIds = new Set(current.tags.map((t) => t.id));

  return all
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 2;
      for (const tag of p.tags) {
        if (currentTagIds.has(tag.id)) score += 1;
      }
      return { post: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.createdAt.localeCompare(a.post.createdAt))
    .slice(0, limit)
    .map((entry) => entry.post);
}
