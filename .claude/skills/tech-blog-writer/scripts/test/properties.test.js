import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPageProperties, CATEGORIES, STATUSES } from '../lib/properties.js';

test('builds Notion properties with Korean field names', () => {
  const props = buildPageProperties({
    title: 'Next.js 16 캐싱 회고',
    category: 'Frontend',
    tags: ['Next.js', 'Cache Components'],
    description: '암묵적 캐싱 폐기 적용기',
    status: 'published',
  });
  assert.deepEqual(props['이름'], { title: [{ text: { content: 'Next.js 16 캐싱 회고' } }] });
  assert.deepEqual(props.category, { multi_select: [{ name: 'Frontend' }] });
  assert.deepEqual(props.tag, { multi_select: [{ name: 'Next.js' }, { name: 'Cache Components' }] });
  assert.deepEqual(props.description, { rich_text: [{ text: { content: '암묵적 캐싱 폐기 적용기' } }] });
  assert.deepEqual(props.status, { select: { name: 'published' } });
});

test('defaults status to published and tags/description to empty', () => {
  const props = buildPageProperties({ title: 'T', category: 'Backend' });
  assert.deepEqual(props.status, { select: { name: 'published' } });
  assert.deepEqual(props.tag, { multi_select: [] });
  assert.deepEqual(props.description, { rich_text: [] });
});

test('rejects empty title, invalid category, invalid status', () => {
  assert.throws(() => buildPageProperties({ title: '', category: 'Frontend' }), /title/);
  assert.throws(() => buildPageProperties({ title: 'T', category: 'frontend' }), /category/);
  assert.throws(() => buildPageProperties({ title: 'T', category: 'Backend', status: 'live' }), /status/);
});

test('exports the allowed category and status lists', () => {
  assert.deepEqual(CATEGORIES, ['Frontend', 'Backend', 'Artificial Intelligence']);
  assert.deepEqual(STATUSES, ['writing', 'ready', 'published']);
});
