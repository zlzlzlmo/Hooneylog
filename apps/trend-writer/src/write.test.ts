import { describe, it, expect } from 'vitest';
import { extractTitle, assembleFooter, appendFooter, deriveTags, runWrite } from './write';
import type { Gemini } from './types';

const topic = { title: 'React 19 Actions', whyNow: 'w', sources: [], area: 'frontend' as const };
const research = { facts: ['f'], sources: ['https://a'] };

describe('extractTitle', () => {
  it('첫 H1을 제목으로 뽑는다', () => {
    expect(extractTitle('# 진짜 제목\n\n본문')).toBe('진짜 제목');
  });
  it('H1이 없으면 주제 폴백은 호출부 책임 — 빈 문자열', () => {
    expect(extractTitle('본문만 있음')).toBe('');
  });
});

describe('assembleFooter', () => {
  it('AI 자동생성 안내와 출처 링크를 담는다', () => {
    const f = assembleFooter(['https://a', 'https://b']);
    expect(f).toContain('자동으로');
    expect(f).toContain('AI가');
    expect(f).toContain('https://a');
    expect(f).toContain('https://b');
  });
});

describe('deriveTags', () => {
  it('분야를 한글 태그로 매핑', () => {
    expect(deriveTags(topic)).toContain('프론트엔드');
  });
});

describe('runWrite', () => {
  it('본문에 푸터를 붙이고 제목/태그를 세팅', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '# React 19 Actions\n\n본문입니다.',
    };
    const draft = await runWrite(gemini, 'm', topic, research);
    expect(draft.title).toBe('React 19 Actions');
    expect(draft.markdown).toContain('참고 출처');
    expect(draft.tags).toContain('프론트엔드');
  });
});
