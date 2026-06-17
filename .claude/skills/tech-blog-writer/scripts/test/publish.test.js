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
