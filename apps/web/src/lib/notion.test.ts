import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { POSTS_TAG, POST_BLOCKS_TAG } from '@/lib/cache-tags';

const { queryMock, retrieveMock, pageToMarkdownMock, toMarkdownStringMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  retrieveMock: vi.fn(),
  pageToMarkdownMock: vi.fn(),
  toMarkdownStringMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@notionhq/client', () => ({
  Client: class {
    databases = { retrieve: retrieveMock };
    dataSources = { query: queryMock };
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
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { cacheLife, cacheTag } from 'next/cache';

function loadNotion() {
  return import('./notion');
}

describe('lib/notion caching', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NOTION_API_KEY = 'test-key';
    process.env.NOTION_DATABASE_ID = 'db-123';
    // 2025-09-03 API: rows hang off a data source, resolved from the database.
    retrieveMock.mockResolvedValue({ data_sources: [{ id: 'ds-1' }] });
  });

  it('tags getAllPosts for posts with hourly revalidation', async () => {
    queryMock.mockResolvedValue({ results: [] });

    const { getAllPosts } = await loadNotion();
    await getAllPosts();

    expect(cacheTag as Mock).toHaveBeenCalledWith(POSTS_TAG);
    expect((cacheLife as Mock).mock.calls[0]?.[0]).toMatchObject({ revalidate: 3600 });
  });

  it('tags the markdown accessor for post blocks', async () => {
    pageToMarkdownMock.mockResolvedValue([]);
    toMarkdownStringMock.mockReturnValue({ parent: '' });

    const { getNotionPageMarkdown } = await loadNotion();
    await getNotionPageMarkdown('page-1');

    expect(cacheTag as Mock).toHaveBeenCalledWith(POST_BLOCKS_TAG);
    expect((cacheLife as Mock).mock.calls[0]?.[0]).toMatchObject({ revalidate: 3600 });
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
    expect(queryMock.mock.calls[0]?.[0]?.data_source_id).toBe('ds-1');
  });
});
