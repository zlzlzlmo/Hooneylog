import { markdownToBlocks } from '@tryfabric/martian';
import type { NotionPort, PublishInput, PublishResult } from './types';

/**
 * Notion API 2025-09-03: rows live on a data source, not on the database itself.
 * The database id stays the configured value; the data source id is resolved from it.
 */
interface NotionClientLike {
  databases: {
    // The SDK's response is a wide union (full | partial); narrow it at the use site.
    retrieve: (args: { database_id: string }) => Promise<unknown>;
  };
  dataSources: {
    query: (args: {
      data_source_id: string;
      start_cursor?: string;
      page_size?: number;
    }) => Promise<{ results: unknown[]; has_more: boolean; next_cursor: string | null }>;
  };
  pages: {
    // The SDK's CreatePageParameters union can't be narrowed here without dragging
    // its property types in; publish.test.ts asserts the parent shape instead.
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

export function buildNotionProperties(input: PublishInput): Record<string, unknown> {
  return {
    이름: { title: [{ text: { content: input.title } }] },
    status: { select: { name: input.status } },
    category: { multi_select: [{ name: input.category }] },
    tag: { multi_select: input.tags.map((t) => ({ name: t })) },
    description: { rich_text: [{ text: { content: buildDescription(input.markdown) } }] },
  };
}

function extractTitleFromPage(page: unknown): string {
  const title = (page as { properties?: { 이름?: { title?: Array<{ plain_text?: string }> } } })
    ?.properties?.이름?.title;
  if (!Array.isArray(title)) return '';
  return title
    .map((t) => t.plain_text ?? '')
    .join('')
    .trim();
}

export function createNotionPort(client: NotionClientLike, databaseId: string): NotionPort {
  let dataSourceId: string | undefined;

  async function resolveDataSourceId(): Promise<string> {
    if (dataSourceId) return dataSourceId;
    const database = (await client.databases.retrieve({ database_id: databaseId })) as {
      data_sources?: { id: string }[];
    };
    const id = database.data_sources?.[0]?.id;
    if (!id) throw new Error(`데이터베이스 ${databaseId} 에서 data source를 찾지 못했습니다.`);
    dataSourceId = id;
    return id;
  }

  return {
    async fetchExistingTitles(): Promise<string[]> {
      const data_source_id = await resolveDataSourceId();
      const titles: string[] = [];
      let cursor: string | undefined;
      do {
        const res = await client.dataSources.query({
          data_source_id,
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
      const data_source_id = await resolveDataSourceId();
      const blocks = markdownToBlocks(input.markdown);
      const res = await client.pages.create({
        parent: { type: 'data_source_id', data_source_id },
        properties: buildNotionProperties(input),
        children: blocks,
      });
      return { pageId: res.id, url: res.url };
    },
  };
}
