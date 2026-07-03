import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { POSTS_TAG, POST_BLOCKS_TAG } from '@/lib/cache-tags';

const { queryMock, pageToMarkdownMock, toMarkdownStringMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  pageToMarkdownMock: vi.fn(),
  toMarkdownStringMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@notionhq/client', () => ({
  Client: class {
    databases = { query: queryMock };
  },
}));

vi.mock('notion-to-md', () => ({
  NotionToMarkdown: class {
    setCustomTransformer = vi.fn();
    pageToMarkdown = pageToMarkdownMock;
    toMarkdownString = toMarkdownStringMock;
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
  revalidateTag: vi.fn(),
}));

import { unstable_cache } from 'next/cache';

function loadNotion() {
  return import('./notion');
}

describe('lib/notion caching', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NOTION_API_KEY = 'test-key';
    process.env.NOTION_DATABASE_ID = 'db-123';
  });

  it('registers getAllPosts in the Data Cache tagged for posts with hourly revalidation', async () => {
    await loadNotion();

    const call = (unstable_cache as Mock).mock.calls.find((c) =>
      c[2]?.tags?.includes(POSTS_TAG)
    );

    expect(call).toBeTruthy();
    expect(call![2].revalidate).toBe(3600);
  });

  it('registers the markdown accessor tagged for post blocks', async () => {
    await loadNotion();

    const calls = (unstable_cache as Mock).mock.calls.filter((c) =>
      c[2]?.tags?.includes(POST_BLOCKS_TAG)
    );

    // getNotionPageMarkdown
    expect(calls.length).toBeGreaterThanOrEqual(1);
    for (const c of calls) expect(c[2].revalidate).toBe(3600);
  });

  it('maps published Notion rows to NotionPost objects', async () => {
    queryMock.mockResolvedValue({
      results: [
        {
          id: 'p1',
          last_edited_time: '2026-02-02T00:00:00Z',
          properties: {
            이름: { title: [{ plain_text: 'Hello' }] },
            created_date: { created_time: '2026-01-01T00:00:00Z' },
            category: { multi_select: [{ name: 'Frontend' }] },
            tag: { multi_select: [{ name: 'react' }] },
            description: { rich_text: [{ plain_text: 'desc' }] },
          },
        },
      ],
    });

    const { getAllPosts } = await loadNotion();
    const posts = await getAllPosts();

    expect(posts).toEqual([
      {
        id: 'p1',
        title: 'Hello',
        tags: [{ name: 'react' }],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-02-02T00:00:00Z',
        category: 'Frontend',
        description: 'desc',
      },
    ]);
  });

  it('paginates getAllPosts across cursors until has_more is false', async () => {
    queryMock
      .mockResolvedValueOnce({
        results: [{ id: 'p1', properties: { 이름: { title: [{ plain_text: 'A' }] } } }],
        has_more: true,
        next_cursor: 'cur2',
      })
      .mockResolvedValueOnce({
        results: [{ id: 'p2', properties: { 이름: { title: [{ plain_text: 'B' }] } } }],
        has_more: false,
        next_cursor: null,
      });

    const { getAllPosts } = await loadNotion();
    const posts = await getAllPosts();

    expect(posts.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1]?.[0]?.start_cursor).toBe('cur2');
  });

});
