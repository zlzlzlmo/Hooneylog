import { describe, it, expect } from 'vitest';
import { buildResearchPrompt, parseResearchFacts, runResearch } from './research';
import type { Gemini } from './types';

const topic = { title: 'RSC 스트리밍', whyNow: 'w', sources: ['https://a'], area: 'frontend' as const };

describe('buildResearchPrompt', () => {
  it('주제 제목을 담고 근거 기반 조사를 지시한다', () => {
    const p = buildResearchPrompt(topic);
    expect(p).toContain('RSC 스트리밍');
    expect(p).toContain('출처');
  });
});

describe('parseResearchFacts', () => {
  it('facts 배열을 파싱한다', () => {
    expect(parseResearchFacts('{"facts":["a","b"]}')).toEqual(['a', 'b']);
  });
  it('facts가 없으면 빈 배열', () => {
    expect(parseResearchFacts('{"x":1}')).toEqual([]);
  });
});

describe('runResearch', () => {
  it('facts와 그라운딩 sources를 합쳐 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '{"facts":["f1"],"sources":["https://x"]}', sources: ['https://g'] }),
      generateText: async () => '',
    };
    const out = await runResearch(gemini, 'm', topic);
    expect(out.facts).toEqual(['f1']);
    expect(out.sources).toContain('https://g');
  });
});
