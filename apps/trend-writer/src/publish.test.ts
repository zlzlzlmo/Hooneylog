import { describe, it, expect } from 'vitest';
import { buildDescription, buildNotionProperties, createNotionPort } from './publish';
import type { PublishInput } from './types';

const input: PublishInput = {
  title: '제목',
  markdown: '# 제목\n\n**본문** 내용',
  tags: ['AI', 'RSC'],
  category: 'Frontend',
  status: 'published',
};

describe('buildDescription', () => {
  it('마크다운 마커를 제거하고 160자로 자른다', () => {
    const d = buildDescription('# 제목\n\n' + 'a'.repeat(300));
    expect(d.length).toBeLessThanOrEqual(163);
    expect(d).not.toContain('#');
    expect(d.endsWith('...')).toBe(true);
  });

  it('짧은 입력은 말줄임표를 붙이지 않고 HTML 태그도 제거한다', () => {
    const d = buildDescription('# 제목\n\n짧다 <b>강조</b>');
    expect(d.endsWith('...')).toBe(false);
    expect(d).not.toContain('<');
  });
});

describe('buildNotionProperties', () => {
  it('status/category/tag/description를 스키마대로 만든다', () => {
    const p = buildNotionProperties(input) as any;
    expect(p['이름'].title[0].text.content).toBe('제목');
    expect(p.status.select.name).toBe('published');
    expect(p.category.multi_select[0].name).toBe('Frontend');
    expect(p.tag.multi_select.map((t: any) => t.name)).toEqual(['AI', 'RSC']);
    expect(typeof p.description.rich_text[0].text.content).toBe('string');
  });
});

describe('createNotionPort', () => {
  it('fetchExistingTitles가 title 프로퍼티에서 제목을 뽑는다', async () => {
    const createArgs: unknown[] = [];
    const client = {
      databases: {
        retrieve: async () => ({ data_sources: [{ id: 'ds-1' }] }),
      },
      dataSources: {
        query: async (args: { data_source_id: string }) => {
          expect(args.data_source_id).toBe('ds-1');
          return {
            results: [{ properties: { 이름: { title: [{ plain_text: '기존글' }] } } }],
            has_more: false,
            next_cursor: null,
          };
        },
      },
      pages: {
        create: async (args: unknown) => {
          createArgs.push(args);
          return { id: 'pid', url: 'https://notion/pid' };
        },
      },
    };
    const port = createNotionPort(client as any, 'db');
    expect(await port.fetchExistingTitles()).toEqual(['기존글']);
    const res = await port.createPost(input);
    expect(res).toEqual({ pageId: 'pid', url: 'https://notion/pid' });
    expect((createArgs[0] as { parent: unknown }).parent).toEqual({
      type: 'data_source_id',
      data_source_id: 'ds-1',
    });
  });
});
