import { describe, it, expect } from 'vitest';
import { runHumanize } from './humanize';
import type { DraftPost, Gemini } from './types';

const draft: DraftPost = { title: '원제목', markdown: '# 원제목\n\n본문', tags: ['프론트엔드'] };

describe('runHumanize', () => {
  it('윤문 결과 마크다운으로 교체하고 태그는 보존', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '# 다듬은 제목\n\n다듬은 본문',
    };
    const out = await runHumanize(gemini, 'm', draft);
    expect(out.markdown).toContain('다듬은 본문');
    expect(out.title).toBe('다듬은 제목');
    expect(out.tags).toEqual(['프론트엔드']);
  });

  it('윤문 결과가 비면 원본 유지(안전 폴백)', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '   ',
    };
    const out = await runHumanize(gemini, 'm', draft);
    expect(out.markdown).toBe(draft.markdown);
    expect(out.title).toBe('원제목');
  });
});
