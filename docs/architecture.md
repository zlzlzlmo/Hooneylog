# 아키텍처 메모

이 레포에서 코드를 어디에 둘지 헷갈릴 때 보는 문서. 규칙은 가능한 한 eslint 로 강제하고,
강제할 수 없는 것만 여기 적는다.

## 레이어

```
app/            라우트. 페이지·라우트 핸들러·메타데이터만. 최상위 레이어라 아무도 임포트하지 않는다.
components/     프레젠테이션. 데이터는 prop 으로 받는다.
hooks/          클라이언트 상태 로직.
services/       브라우저에서 자기 API(/api/*)를 호출하는 얇은 클라이언트.
lib/            서버 전용 데이터 접근·인프라 (notion, views, view-guard, og).
utils/          의존성 없는 순수 함수 (toc, date, category, related-posts).
```

강제되는 규칙 (`packages/eslint-config/next.js`):

- 하위 레이어에서 `@/app/*` 임포트 금지 — 라우트를 되참조하면 레이어가 뒤집힌다.
- `components/**`, `hooks/**` 에서 `@/lib/notion`, `@/lib/views`, `@/lib/view-guard` 직접 임포트 금지.
  서버 데이터는 서버 컴포넌트가 읽어 prop 으로 내리고, 클라이언트가 필요하면 `services/` 를 거친다.
- 깊은 상대 경로(`../../`) 금지 — `@/...` 절대 경로 사용.
- 패키지 경계는 `turbo boundaries` 가 CI 에서 검사한다.

## 캐싱 (Next.js Cache Components)

`cacheComponents: true` 라서 세그먼트 단위 `export const revalidate` 는 쓸 수 없다.

- Notion 읽기는 `lib/notion.ts` 안에서 `'use cache'` + `cacheTag()` + `cacheLife()`.
- 태그는 `lib/cache-tags.ts` 한 곳에서만 정의하고, `/api/revalidate` 웹훅이 같은 태그를 무효화한다.
- 요청 시점 데이터(조회수, 검색 파라미터)는 Suspense 경계 아래에 두고,
  `lib/views.ts`/라우트 핸들러에서 `await connection()` 으로 요청 시점임을 선언한다.
- 프리렌더 중 `new Date()`/`Math.random()` 을 읽으면 빌드가 실패한다. 값이 필요하면
  캐시된 함수 안에서 읽거나(예: footer 의 연도), 요청 시점으로 미룬다.

## 테스트

- 테스트는 소스 옆에 둔다 (`views.ts` ↔ `views.test.ts`).
- async 서버 컴포넌트는 jsdom 에서 렌더되지 않는다. 렌더가 목적이면 목으로 대체한다.
- `turbo run test` 가 CI 와 `pnpm check` 양쪽에서 돈다.

## 알려진 부채

- `components/` 가 라우트별 colocation 이 아니라 전역 분류(blocks/elements/layout)로 나뉘어 있다.
  라우트 단위(`app/post/[slug]/_components/`)로 옮기는 편이 찾기 쉽지만, 진행 중인 재디자인과
  충돌해서 미뤘다.
- ESLint 10 / TypeScript 7 은 보류. `eslint-plugin-react`·`eslint-plugin-jsx-a11y` 가 아직
  eslint 9 까지만 지원하고, `typescript-eslint` peer 가 `typescript <6.1.0` 이다.
