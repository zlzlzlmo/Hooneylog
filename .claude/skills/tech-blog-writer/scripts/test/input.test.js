import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../lib/input.js';

test('parseInput accepts a valid payload and fills defaults', () => {
  const out = parseInput(JSON.stringify({
    title: '제목', category: 'Frontend', markdown: '# 제목',
  }));
  assert.equal(out.title, '제목');
  assert.equal(out.category, 'Frontend');
  assert.equal(out.status, 'published');
  assert.deepEqual(out.tags, []);
  assert.equal(out.description, '');
});

test('parseInput throws on invalid JSON', () => {
  assert.throws(() => parseInput('{not json'), /JSON/);
});

test('parseInput throws when required fields are missing', () => {
  assert.throws(() => parseInput(JSON.stringify({ category: 'Frontend', markdown: 'x' })), /title/);
  assert.throws(() => parseInput(JSON.stringify({ title: 'T', markdown: 'x' })), /category/);
  assert.throws(() => parseInput(JSON.stringify({ title: 'T', category: 'Frontend' })), /markdown/);
});
