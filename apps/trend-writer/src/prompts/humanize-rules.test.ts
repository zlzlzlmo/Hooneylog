import { describe, it, expect } from 'vitest';
import { HUMANIZE_RULES, buildHumanizePrompt } from './humanize-rules';

describe('humanize rules', () => {
  it('핵심 S1 패턴과 의미불변 원칙을 담는다', () => {
    expect(HUMANIZE_RULES).toContain('이중 피동');
    expect(HUMANIZE_RULES).toContain('결론적으로');
    expect(HUMANIZE_RULES).toContain('의미 불변');
    expect(HUMANIZE_RULES).toContain('3인칭 대명사');
  });

  it('대상 마크다운을 프롬프트에 주입하고 코드 보존을 지시한다', () => {
    const p = buildHumanizePrompt('# 제목\n\n본문');
    expect(p).toContain('# 제목');
    expect(p).toContain('코드블록');
  });
});
