import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilterPost } from './use-filter-post';
import { ALL } from '@/utils/category';
import { NotionPost } from '@hooneylog/shared-types';

const posts = [
  { id: '1', title: 'FE', description: '', category: 'Frontend', createdAt: '', updatedAt: '', tags: [] },
  { id: '2', title: 'BE', description: '', category: 'Backend', createdAt: '', updatedAt: '', tags: [] },
] as unknown as NotionPost[];

describe('useFilterPost', () => {
  it('defaults to 전체 (all posts) when no initial category is given', () => {
    const { result } = renderHook(() => useFilterPost(posts));
    expect(result.current.currentActiveCategory).toBe(ALL);
    expect(result.current.filteredPosts).toHaveLength(2);
  });

  it('seeds the active category from initialCategory and filters to it', () => {
    const { result } = renderHook(() => useFilterPost(posts, 'Frontend'));
    expect(result.current.currentActiveCategory).toBe('Frontend');
    expect(result.current.filteredPosts.map((p) => p.id)).toEqual(['1']);
  });
});
