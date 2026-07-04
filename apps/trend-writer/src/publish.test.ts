import { describe, it, expect } from 'vitest';
import { buildDescription, buildNotionProperties, createNotionPort } from './publish';
import type { PublishInput } from './types';

const input: PublishInput = { title: '제목', markdown: '# 제목\n\n**본문** 내용', tags: ['AI', 'RSC'], status: 'published' };

describe('buildDescription', () => {
  it('마크다운 마커를 제거하고 160자로 자른다', () => {
    const d = buildDescription('# 제목\n\n' + 'a'.repeat(300));
    expect(d.length).toBeLessThanOrEqual(163);
    expect(d).not.toContain('#');
    expect(d.endsWith('...')).toBe(true);
  });
});

describe('buildNotionProperties', () => {
  it('status/category/tag/description를 스키마대로 만든다', () => {
    const p = buildNotionProperties(input, 'AI 트렌드') as any;
    expect(p['이름'].title[0].text.content).toBe('제목');
    expect(p.status.select.name).toBe('published');
    expect(p.category.multi_select[0].name).toBe('AI 트렌드');
    expect(p.tag.multi_select.map((t: any) => t.name)).toEqual(['AI', 'RSC']);
    expect(typeof p.description.rich_text[0].text.content).toBe('string');
  });
});

describe('createNotionPort', () => {
  it('fetchExistingTitles가 title 프로퍼티에서 제목을 뽑는다', async () => {
    const client = {
      databases: {
        query: async () => ({
          results: [{ properties: { 이름: { title: [{ plain_text: '기존글' }] } } }],
          has_more: false,
          next_cursor: null,
        }),
      },
      pages: { create: async () => ({ id: 'pid', url: 'https://notion/pid' }) },
    };
    const port = createNotionPort(client as any, 'db', 'AI 트렌드');
    expect(await port.fetchExistingTitles()).toEqual(['기존글']);
    const res = await port.createPost(input);
    expect(res).toEqual({ pageId: 'pid', url: 'https://notion/pid' });
  });
});
