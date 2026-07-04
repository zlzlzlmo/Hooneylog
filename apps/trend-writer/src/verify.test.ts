import { describe, it, expect } from 'vitest';
import { buildVerifyPrompt, parseVerdict, runVerify } from './verify';
import type { DraftPost, Gemini } from './types';

const draft: DraftPost = { title: 'T', markdown: '# T\n\n본문\n\n참고 출처\n- https://a', tags: ['AI'] };

describe('buildVerifyPrompt', () => {
  it('4개 검증 기준과 기존 제목을 담는다', () => {
    const p = buildVerifyPrompt(draft, ['기존글1']);
    expect(p).toContain('기존글1');
    expect(p).toContain('출처');
    expect(p).toContain('양식');
  });
});

describe('parseVerdict', () => {
  it('pass/reasons를 파싱', () => {
    expect(parseVerdict('{"pass":true,"reasons":[]}')).toEqual({ pass: true, reasons: [] });
  });
  it('pass가 불리언이 아니면 실패로 간주', () => {
    expect(parseVerdict('{"reasons":["x"]}').pass).toBe(false);
  });
  it('파싱 불가 시 실패 + 사유', () => {
    const v = parseVerdict('완전 깨진 응답');
    expect(v.pass).toBe(false);
    expect(v.reasons.length).toBeGreaterThan(0);
  });
});

describe('runVerify', () => {
  it('gemini 응답을 판정으로 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '{"pass":false,"reasons":["근거 부족"]}',
    };
    const v = await runVerify(gemini, 'm', draft, []);
    expect(v.pass).toBe(false);
    expect(v.reasons).toContain('근거 부족');
  });
});
