import 'server-only';
import { Client } from '@notionhq/client';
import { cache } from 'react';
import { INotionProperties, NotionPost, IRawNotionPost } from '@hooneylog/shared-types';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// Add custom transformer for Callouts
n2m.setCustomTransformer('callout', async (block) => {
  if (!('type' in block) || block.type !== 'callout') return '';
  const { callout } = block;
  const icon = callout.icon?.type === 'emoji' ? callout.icon.emoji : '💡';
  const text = callout.rich_text.map((t) => t.plain_text).join('');
  
  return `<div class="notion-callout">
    <div class="notion-callout-icon">${icon}</div>
    <div class="notion-callout-content">${text}</div>
  </div>`;
});

const databaseId = process.env.NOTION_DATABASE_ID ?? '';

export const getNotionPageMarkdown = cache(async (pageId: string) => {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdblocks);
  
  // Fix notion-to-md's adjacent marker bugs that break ReactMarkdown
  // Example: **`code`****text** -> **`code`text**
  mdString.parent = mdString.parent
    .replace(/\*\*\*\*/g, '')
    .replace(/~~~~/g, '');

  return mdString;
});

class NotionBlockMapper {
  private readonly properties: INotionProperties;

  constructor(properties: INotionProperties) {
    this.properties = properties;
  }

  get title() {
    return this.properties.이름?.title?.[0]?.plain_text || '';
  }

  get createdAt() {
    return this.properties.created_date?.created_time || '';
  }

  get category() {
    return this.properties.category?.multi_select?.[0]?.name || '';
  }

  get tags() {
    return this.properties.tag?.multi_select || [];
  }

  get description() {
    return this.properties.description?.rich_text?.[0]?.plain_text || '';
  }
}

export const getAllPosts = cache(async (): Promise<NotionPost[]> => {
  if (!databaseId) return [];

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'status',
      select: {
        equals: 'published',
      },
    },
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
  });

  const rawPosts = response.results as unknown as IRawNotionPost[];

  return rawPosts.map(({ id, properties }) => {
    const block = new NotionBlockMapper(properties);
    return {
      id,
      title: block.title,
      tags: block.tags,
      createdAt: block.createdAt,
      category: block.category,
      description: block.description,
    };
  });
});

export const getPostById = cache(async (postId: string): Promise<NotionPost | undefined> => {
  const posts = await getAllPosts();
  return posts.find(({ id }) => id === postId);
});

export const getBlocksById = cache(async (id: string) => {
  if (!id) return [];
  const blocks = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      block_id: id,
      start_cursor: cursor,
    });
    
    blocks.push(...results);
    if (!next_cursor) {
      break;
    }

    cursor = next_cursor;
  }

  return blocks.map((block) => {
    if (!('type' in block)) return { id: block.id };
    const { id, type } = block;

    return {
      id,
      type,
      [type as string]: (block as Record<string, unknown>)[type as string],
    };
  });
});
