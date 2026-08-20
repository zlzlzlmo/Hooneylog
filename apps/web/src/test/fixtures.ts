import type { NotionPost } from '@hooneylog/shared-types';

const LONG_KO =
  '리액트 서버 컴포넌트에서 스트리밍 렌더링을 적용하면서 겪은 하이드레이션 불일치 문제를 처음부터 다시 짚어봤습니다. 캐시 무효화 타이밍과 Suspense 경계 설정이 핵심이었어요.';

/** Deliberately hostile: a long unbroken token that will overflow a naive layout. */
const UNBREAKABLE = 'ThisIsOneVeryLongUnbrokenIdentifierUsedToProveTheLayoutHoldsUnderPressure';

export const CATEGORIES = ['Frontend', 'Backend', 'Artificial Intelligence'] as const;

export function makePost(index: number, overrides: Partial<NotionPost> = {}): NotionPost {
  const category = CATEGORIES[index % CATEGORIES.length]!;
  return {
    id: `post-${index}`,
    category,
    createdAt: `2026-0${(index % 9) + 1}-15T00:00:00.000Z`,
    updatedAt: `2026-0${(index % 9) + 1}-16T00:00:00.000Z`,
    title:
      index === 0
        ? `${UNBREAKABLE} 를 포함한 아주 긴 제목으로 줄바꿈과 잘림을 동시에 검증합니다`
        : `${category} 실전 기록 ${index}`,
    description: index === 0 ? `${LONG_KO} ${UNBREAKABLE}` : LONG_KO,
    tags: [
      { id: `tag-${index}-a`, name: 'React' },
      { id: `tag-${index}-b`, name: 'TypeScript' },
      { id: `tag-${index}-c`, name: UNBREAKABLE.slice(0, 32) },
    ],
    ...overrides,
  };
}

export const POSTS: NotionPost[] = Array.from({ length: 8 }, (_, i) => makePost(i));

export const MARKDOWN = [
  '## 문제 상황',
  '',
  LONG_KO,
  '',
  '`inline-code` 와 ' + UNBREAKABLE + ' 같은 긴 토큰도 포함합니다.',
  '',
  '### 재현 절차',
  '',
  '1. 서버 컴포넌트에서 fetch',
  '2. 클라이언트에서 재검증',
  '',
  '| 항목 | 값 |',
  '| --- | --- |',
  '| 캐시 | 1시간 |',
  '| 재검증 | on-demand |',
  '',
  '```ts',
  'export const revalidate = 3600; // a fairly long line of code to force horizontal scrolling inside the block',
  '```',
  '',
  '## 결론',
  '',
  '> 인용문도 한 줄 넣어 둡니다.',
].join('\n');
