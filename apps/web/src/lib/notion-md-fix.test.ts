import { describe, it, expect, vi } from 'vitest';

// notion.ts pulls in server-only + the Notion SDK at import; stub them so we can
// exercise the REAL fixMarkdown instead of a throwaway inline reimplementation.
vi.mock('server-only', () => ({}));
vi.mock('@notionhq/client', () => ({ Client: class {} }));
vi.mock('notion-to-md', () => ({
  NotionToMarkdown: class {
    setCustomTransformer = vi.fn();
  },
}));
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}));

import { fixMarkdown } from './notion';

describe('fixMarkdown (real implementation)', () => {
  it('converts bold markers to <strong> so adjacent text still renders bold', () => {
    expect(fixMarkdown('**Supavisor(연결 풀러)**')).toBe('<strong>Supavisor(연결 풀러)</strong>');
  });

  it('removes empty bold markers', () => {
    expect(fixMarkdown('****')).toBe('');
  });

  it('collapses a bold marker containing only a space into a single space', () => {
    expect(fixMarkdown('** **')).toBe(' ');
  });

  it('recursively unescapes over-escaped markers (single and double)', () => {
    expect(fixMarkdown('\\*hello\\*')).toBe('*hello*');
    expect(fixMarkdown('\\\\*deep\\\\*')).toBe('*deep*');
  });

  it("normalizes Notion's '1)' ordered-list style to '1.'", () => {
    expect(fixMarkdown('1) first\n2) second')).toBe('1. first\n2. second');
  });

  it('returns empty/falsy input unchanged', () => {
    expect(fixMarkdown('')).toBe('');
  });
});
