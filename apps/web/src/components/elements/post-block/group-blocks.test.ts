import { describe, it, expect } from 'vitest';
import { BlockObjectResponse } from '@hooneylog/shared-types';
import { groupBlocks } from './group-blocks';

const b = (id: string, type: string) => ({ id, type } as unknown as BlockObjectResponse);

describe('groupBlocks', () => {
  it('groups consecutive bulleted items into one ul group', () => {
    const out = groupBlocks([b('1', 'bulleted_list_item'), b('2', 'bulleted_list_item')]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ kind: 'ul' });
    expect((out[0] as Extract<typeof out[0], { kind: 'ul' }>).items).toHaveLength(2);
  });

  it('groups consecutive numbered items into one ol group', () => {
    const out = groupBlocks([b('1', 'numbered_list_item'), b('2', 'numbered_list_item')]);
    expect(out[0]).toMatchObject({ kind: 'ol' });
    expect((out[0] as Extract<typeof out[0], { kind: 'ol' }>).items).toHaveLength(2);
  });

  it('keeps bulleted and numbered runs separate and preserves order', () => {
    const out = groupBlocks([
      b('p', 'paragraph'),
      b('1', 'numbered_list_item'),
      b('2', 'numbered_list_item'),
      b('3', 'bulleted_list_item'),
    ]);
    expect(out.map((g) => g.kind)).toEqual(['single', 'ol', 'ul']);
  });

  it('wraps non-list blocks as singles', () => {
    const out = groupBlocks([b('p', 'paragraph')]);
    expect(out[0]).toMatchObject({ kind: 'single' });
  });
});
