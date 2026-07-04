import { describe, it, expect } from 'vitest';
import { BLOG_FORMAT_RULES, buildWritePrompt } from './blog-format';

const topic = { title: 'React 19 Actions 완전정복', whyNow: '19 GA', sources: ['https://react.dev'], area: 'frontend' as const };
const research = { facts: ['useActionState는 폼 상태를 관리한다'], sources: ['https://react.dev/actions'] };

describe('buildWritePrompt', () => {
  it('6단 헤딩과 콜아웃 규칙을 포함한다', () => {
    expect(BLOG_FORMAT_RULES).toContain('## 1. 문제의 배경');
    expect(BLOG_FORMAT_RULES).toContain('## 6. 마치며');
    expect(BLOG_FORMAT_RULES).toContain('💡 핵심 요약');
  });

  it('주제와 근거 사실을 프롬프트에 주입한다', () => {
    const p = buildWritePrompt(topic, research);
    expect(p).toContain('React 19 Actions 완전정복');
    expect(p).toContain('useActionState는 폼 상태를 관리한다');
    expect(p).toContain('존댓말');
  });
});
