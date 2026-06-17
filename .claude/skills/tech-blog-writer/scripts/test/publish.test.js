import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPost } from '../lib/publish.js';

function mockNotion(calls) {
  return {
    pages: {
      create: async (args) => {
        calls.create.push(args);
        return { id: 'page-123', url: 'https://notion.so/page-123' };
      },
    },
    blocks: {
      children: {
        append: async (args) => {
          calls.append.push(args);
          return {};
        },
      },
    },
  };
}

test('createPost creates page with properties and initial blocks, returns id/url', async () => {
  const calls = { create: [], append: [] };
  const notion = mockNotion(calls);
  const result = await createPost(notion, 'db-1', {
    title: '제목', category: 'Frontend', tags: ['React'], description: '요약',
    markdown: '# 제목\n\n본문입니다.', status: 'published',
  });
  assert.deepEqual(result, { id: 'page-123', url: 'https://notion.so/page-123' });
  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].parent.database_id, 'db-1');
  assert.deepEqual(calls.create[0].properties.category, { multi_select: [{ name: 'Frontend' }] });
  assert.ok(Array.isArray(calls.create[0].children));
  assert.equal(calls.append.length, 0);
});

test('createPost appends overflow chunks beyond 100 blocks', async () => {
  const calls = { create: [], append: [] };
  const notion = mockNotion(calls);
  const markdown = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  await createPost(notion, 'db-1', {
    title: '긴 글', category: 'Backend', markdown,
  });
  assert.equal(calls.create.length, 1);
  assert.ok(calls.create[0].children.length <= 100);
  assert.ok(calls.append.length >= 1);
  for (const call of calls.append) {
    assert.equal(call.block_id, 'page-123');
    assert.ok(call.children.length <= 100);
  }
});

// ── 429 backoff + partial-append tests ──────────────────────────────────────

test('429 on create is retried then succeeds', async () => {
  let createCallCount = 0;
  const notion = {
    pages: {
      create: async (args) => {
        createCallCount += 1;
        if (createCallCount === 1) {
          const err = new Error('rate limited');
          err.status = 429;
          throw err;
        }
        return { id: 'page-123', url: 'https://notion.so/page-123' };
      },
    },
    blocks: {
      children: {
        append: async () => ({}),
      },
    },
  };
  const result = await createPost(notion, 'db-1', {
    title: '제목', category: 'Frontend', tags: [], description: '요약',
    markdown: '# 제목\n\n본문입니다.', status: 'published',
  }, { baseDelay: 0 });
  assert.deepEqual(result, { id: 'page-123', url: 'https://notion.so/page-123' });
  assert.equal(createCallCount, 2);
});

test('429 on append is retried then succeeds', async () => {
  let appendCallCount = 0;
  const notion = {
    pages: {
      create: async () => ({ id: 'page-123', url: 'https://notion.so/page-123' }),
    },
    blocks: {
      children: {
        append: async () => {
          appendCallCount += 1;
          if (appendCallCount === 1) {
            const err = new Error('rate limited');
            err.code = 'rate_limited';
            throw err;
          }
          return {};
        },
      },
    },
  };
  const markdown = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  const result = await createPost(notion, 'db-1', {
    title: '긴 글', category: 'Backend', markdown,
  }, { baseDelay: 0 });
  assert.deepEqual(result, { id: 'page-123', url: 'https://notion.so/page-123' });
  assert.ok(appendCallCount >= 2);
});

test('non-429 create error propagates without retry', async () => {
  let createCallCount = 0;
  const notion = {
    pages: {
      create: async () => {
        createCallCount += 1;
        const err = new Error('internal server error');
        err.status = 500;
        throw err;
      },
    },
    blocks: {
      children: {
        append: async () => ({}),
      },
    },
  };
  await assert.rejects(
    () => createPost(notion, 'db-1', {
      title: '제목', category: 'Frontend', markdown: '# 제목',
    }, { baseDelay: 0 }),
    (err) => err.status === 500,
  );
  assert.equal(createCallCount, 1);
});

test('append failure after retries surfaces pageUrl + failedChunkIndex', async () => {
  const notion = {
    pages: {
      create: async () => ({ id: 'page-123', url: 'u' }),
    },
    blocks: {
      children: {
        append: async () => {
          const err = new Error('rate limited');
          err.status = 429;
          throw err;
        },
      },
    },
  };
  const markdown = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  await assert.rejects(
    () => createPost(notion, 'db-1', {
      title: '긴 글', category: 'Backend', markdown,
    }, { retries: 1, baseDelay: 0 }),
    (err) => err.pageUrl === 'u' && err.failedChunkIndex === 0,
  );
});
