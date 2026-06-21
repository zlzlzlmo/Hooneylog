import { describe, it, expect } from 'vitest';
import { getRelatedPosts } from './related-posts';
import { NotionPost } from '@hooneylog/shared-types';

const mk = (id: string, category: string, tagNames: string[], createdAt = '2026-01-01'): NotionPost => ({
  id,
  category,
  createdAt,
  description: '',
  title: id,
  tags: tagNames.map((n) => ({ id: n, name: n })),
});

describe('getRelatedPosts', () => {
  it('excludes the current post', () => {
    const cur = mk('a', 'React', ['hooks']);
    const all = [cur, mk('b', 'React', ['hooks'])];
    expect(getRelatedPosts(all, cur).map((p) => p.id)).toEqual(['b']);
  });

  it('ranks same-category and shared-tag posts higher', () => {
    const cur = mk('a', 'React', ['hooks', 'rsc']);
    const sameCatSharedTag = mk('b', 'React', ['hooks']);   // +2 +1 = 3
    const sharedTwoTags = mk('c', 'CSS', ['hooks', 'rsc']); // +2 = 2
    const unrelated = mk('d', 'Go', ['cli']);               // 0
    const out = getRelatedPosts([cur, unrelated, sharedTwoTags, sameCatSharedTag], cur);
    expect(out.map((p) => p.id)).toEqual(['b', 'c']);
  });

  it('respects the limit', () => {
    const cur = mk('a', 'React', ['x']);
    const all = [cur, mk('b', 'React', []), mk('c', 'React', []), mk('d', 'React', [])];
    expect(getRelatedPosts(all, cur, 2)).toHaveLength(2);
  });
});
