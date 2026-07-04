import { markdownToBlocks } from '@tryfabric/martian';
import type { NotionPort, PublishInput, PublishResult } from './types';

interface NotionClientLike {
  databases: {
    query: (args: {
      database_id: string;
      start_cursor?: string;
      page_size?: number;
    }) => Promise<{ results: unknown[]; has_more: boolean; next_cursor: string | null }>;
  };
  pages: {
    create: (args: unknown) => Promise<{ id: string; url: string }>;
  };
}

export function buildDescription(markdown: string): string {
  const clean = markdown
    .replace(/^.*🤖.*$/gm, '') // AI 고지 줄은 요약(SEO description)에서 제외
    .replace(/<[^>]+>/g, '')
    .replace(/[#*>`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const truncated = clean.length > 160;
  return truncated
    ? `${clean.slice(0, 160).trim().replace(/\n/g, ' ')}...`
    : clean.trim().replace(/\n/g, ' ');
}

export function buildNotionProperties(
  input: PublishInput,
  aiCategory: string,
): Record<string, unknown> {
  return {
    이름: { title: [{ text: { content: input.title } }] },
    status: { select: { name: input.status } },
    category: { multi_select: [{ name: aiCategory }] },
    tag: { multi_select: input.tags.map((t) => ({ name: t })) },
    description: { rich_text: [{ text: { content: buildDescription(input.markdown) } }] },
  };
}

function extractTitleFromPage(page: unknown): string {
  const title = (page as { properties?: { 이름?: { title?: Array<{ plain_text?: string }> } } })
    ?.properties?.이름?.title;
  if (!Array.isArray(title)) return '';
  return title.map((t) => t.plain_text ?? '').join('').trim();
}

export function createNotionPort(
  client: NotionClientLike,
  databaseId: string,
  aiCategory: string,
): NotionPort {
  return {
    async fetchExistingTitles(): Promise<string[]> {
      const titles: string[] = [];
      let cursor: string | undefined;
      do {
        const res = await client.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
          page_size: 100,
        });
        for (const page of res.results) {
          const t = extractTitleFromPage(page);
          if (t) titles.push(t);
        }
        cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
      } while (cursor);
      return titles;
    },
    async createPost(input: PublishInput): Promise<PublishResult> {
      const blocks = markdownToBlocks(input.markdown);
      const res = await client.pages.create({
        parent: { database_id: databaseId },
        properties: buildNotionProperties(input, aiCategory),
        children: blocks,
      });
      return { pageId: res.id, url: res.url };
    },
  };
}
