import { buildPageProperties } from './properties.js';
import { markdownToBlockChunks } from './blocks.js';

function isRateLimited(err) {
  return !!err && ((err.status === 429) || (err.code === 'rate_limited'));
}

async function withRetry(fn, { retries = 3, baseDelay = 300, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRateLimited(err)) throw err;
      await sleep(baseDelay * 2 ** attempt); // exponential backoff
      attempt += 1;
    }
  }
}

export async function createPost(notion, databaseId, input, { retries = 3, baseDelay = 300, sleep } = {}) {
  if (!databaseId) throw new Error('databaseId is required (NOTION_DATABASE_ID not set?)');

  const retryOpts = { retries, baseDelay, ...(sleep !== undefined ? { sleep } : {}) };

  const { title, category, tags, description, status, markdown } = input;
  const properties = buildPageProperties({ title, category, tags, description, status });
  const { initial, rest } = markdownToBlockChunks(markdown ?? '');

  const page = await withRetry(() => notion.pages.create({
    parent: { database_id: databaseId },
    properties,
    children: initial,
  }), retryOpts);

  for (let i = 0; i < rest.length; i += 1) {
    try {
      await withRetry(() => notion.blocks.children.append({ block_id: page.id, children: rest[i] }), retryOpts);
    } catch (err) {
      const e = new Error(`block append failed at chunk ${i} of ${rest.length}: ${err.message}`);
      e.pageId = page.id;
      e.pageUrl = page.url;
      e.failedChunkIndex = i;
      e.cause = err;
      throw e;
    }
  }

  return { id: page.id, url: page.url };
}
