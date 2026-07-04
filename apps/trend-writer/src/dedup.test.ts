import { describe, it, expect } from 'vitest';
import { normalizeTitle, isDuplicate, pickFreshTopic } from './dedup';

describe('normalizeTitle', () => {
  it('대소문자·공백·특수문자를 제거해 비교키를 만든다', () => {
    expect(normalizeTitle('React 19: Actions!')).toBe(normalizeTitle('react19actions'));
  });
});

describe('isDuplicate', () => {
  it('정규화 후 동일하면 중복', () => {
    expect(isDuplicate('React 19 Actions', ['react 19 actions'])).toBe(true);
  });
  it('6자 이상 부분 포함도 중복', () => {
    expect(isDuplicate('Next.js 15 캐싱 완전정복', ['Next.js 15 캐싱'])).toBe(true);
  });
  it('무관한 제목은 비중복', () => {
    expect(isDuplicate('GraphQL 구독', ['REST 페이지네이션'])).toBe(false);
  });
});

describe('pickFreshTopic', () => {
  it('기존과 겹치지 않는 첫 후보를 고른다', () => {
    const cands = [
      { title: 'React 19 Actions', whyNow: '', sources: [], area: 'frontend' as const },
      { title: 'Bun 1.2 워크스페이스', whyNow: '', sources: [], area: 'backend' as const },
    ];
    const picked = pickFreshTopic(cands, ['react 19 actions']);
    expect(picked?.title).toBe('Bun 1.2 워크스페이스');
  });
  it('전부 중복이면 null', () => {
    const cands = [{ title: 'React 19 Actions', whyNow: '', sources: [], area: 'frontend' as const }];
    expect(pickFreshTopic(cands, ['React 19 Actions'])).toBeNull();
  });
});
