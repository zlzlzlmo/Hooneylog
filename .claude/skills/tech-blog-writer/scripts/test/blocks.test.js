import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkBlocks, markdownToBlockChunks } from '../lib/blocks.js';

test('chunkBlocks splits into groups no larger than size', () => {
  const arr = Array.from({ length: 250 }, (_, i) => i);
  const chunks = chunkBlocks(arr, 100);
  assert.equal(chunks.length, 3);
  assert.deepEqual(chunks.map((c) => c.length), [100, 100, 50]);
});

test('chunkBlocks returns empty array for empty input', () => {
  assert.deepEqual(chunkBlocks([], 100), []);
});

test('markdownToBlockChunks converts markdown and separates initial/rest', () => {
  const md = '# 제목\n\n첫 단락입니다.\n\n```js\nconst a = 1;\n```';
  const { initial, rest } = markdownToBlockChunks(md);
  assert.ok(initial.length >= 1);
  assert.ok(initial.length <= 100);
  assert.ok(Array.isArray(rest));
  assert.equal(initial[0].type, 'heading_1');
});

test('markdownToBlockChunks splits >100 blocks into initial + rest', () => {
  const md = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  const { initial, rest } = markdownToBlockChunks(md);
  assert.equal(initial.length, 100);
  assert.equal(rest.length, 1);
  assert.ok(rest[0].length <= 100);
});
