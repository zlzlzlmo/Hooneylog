import { describe, it, expect } from 'vitest';
import {
  extractTitle,
  insertDisclosure,
  assembleFooter,
  appendFooter,
  deriveTags,
  runWrite,
} from './write';
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

describe('insertDisclosure', () => {
  it('제목(H1) 바로 다음에 AI 고지를 삽입한다', () => {
    const out = insertDisclosure('# 제목\n\n본문');
    const lines = out.split('\n');
    const h1 = lines.findIndex((l) => l.startsWith('# '));
    expect(out).toContain('AI 글입니다');
    expect(out).toContain('🤖');
    // 고지는 제목 뒤, 본문 앞에 위치
    expect(out.indexOf('🤖')).toBeGreaterThan(out.indexOf('# 제목'));
    expect(out.indexOf('🤖')).toBeLessThan(out.indexOf('본문'));
    expect(h1).toBe(0);
  });
  it('H1이 없으면 맨 앞에 붙인다', () => {
    expect(insertDisclosure('본문만').startsWith('> 🤖')).toBe(true);
  });
});

describe('assembleFooter', () => {
  it('참고 출처 링크만 담고 AI 문구는 넣지 않는다', () => {
    const f = assembleFooter(['https://a', 'https://b']);
    expect(f).toContain('참고 출처');
    expect(f).toContain('https://a');
    expect(f).toContain('https://b');
    expect(f).not.toContain('🤖');
  });
});

describe('deriveTags', () => {
  it('분야를 한글 태그로 매핑', () => {
    expect(deriveTags(topic)).toContain('프론트엔드');
  });
});

describe('runWrite', () => {
  it('푸터 없이 본문·제목/태그만 세팅 (푸터는 파이프라인에서 결정론적으로 부착)', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '# React 19 Actions\n\n본문입니다.',
    };
    const draft = await runWrite(gemini, 'm', topic, research);
    expect(draft.title).toBe('React 19 Actions');
    expect(draft.markdown).not.toContain('참고 출처');
    expect(draft.tags).toContain('프론트엔드');
  });
});
