import { buildPageProperties } from './properties.js';
import { markdownToBlockChunks } from './blocks.js';

export async function createPost(notion, databaseId, input) {
  if (!databaseId) throw new Error('databaseId is required (NOTION_DATABASE_ID not set?)');

  const { title, category, tags, description, status, markdown } = input;
  const properties = buildPageProperties({ title, category, tags, description, status });
  const { initial, rest } = markdownToBlockChunks(markdown ?? '');

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
    children: initial,
  });

  for (const chunk of rest) {
    await notion.blocks.children.append({ block_id: page.id, children: chunk });
  }

  return { id: page.id, url: page.url };
}
