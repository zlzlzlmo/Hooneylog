# 프론트엔드 트렌드·표준 레퍼런스 (2026)

> category=Frontend 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §1·§2 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.

## 1. 프론트엔드 — 프레임워크 / 렌더링

### 핵심 트렌드
- **Next.js 16 Cache Components — 명시적 캐싱 + PPR 완성** `mainstream` ✅
  2025-10-21 출시. App Router의 암묵적 캐싱을 폐기, 기본은 동적 렌더링이고 `'use cache'` 디렉티브로만 명시적 캐싱. 무효화 API: `revalidateTag(tag, profile)`(SWR), `updateTag()`(read-your-writes, Server Actions 전용), `refresh()`(비캐시). ⚠️ `experimental.dynamicIO`는 "제거"가 아니라 `cacheComponents`로 rename.
- **Turbopack가 Next.js 기본 번들러로 표준화** `mainstream` ✅
  Next.js 16에서 dev/prod 모두 stable, 신규 프로젝트 기본. webpack은 `--webpack` 옵트아웃 가능하나 사실상 레거시.
- **React Compiler 1.0 stable — 자동 메모이제이션 표준화** `growing` ✅
  2025-10-07 stable. `useMemo`/`useCallback`/`React.memo`를 사실상 불필요화. 점진 도입 가능(Babel 의존 → 빌드 시간 증가 감안).
- **Signals / fine-grained reactivity가 React 외 거의 모든 프레임워크의 표준** `mainstream` ✅
  Solid·Vue 3·Angular(zoneless 전환)·Svelte 5(Runes: `$state`/`$derived`/`$effect`)·Preact가 수렴. React만 VDOM+컴파일러 노선.
- **Astro 부상 — 메타프레임워크 만족도 1위, Server Islands** `growing` ✅
  State of JS 2025에서 Astro가 Next.js를 큰 차로 앞섬. Server Islands(정적 CDN에 동적 콘텐츠 지연 주입), Content Layer.
- **Remix → React Router 7 통합, Remix v3의 React 이탈** `emerging` ✅
  Remix가 React Router v7 'Framework Mode'로 흡수. 동시에 Remix v3는 Preact 포크 기반 'Model-First'(AI/LLM 친화) 독자 모델 선언. RSC 생태계 분화의 상징.
- **React 19.2 부분 프리렌더 API** `growing` ✅
  2025-10-01. `prerender()`/`resume()` PPR API, View Transitions, `<Activity>`, `useEffectEvent`, `cacheSignal`.
- **TanStack Start v1 — 클라이언트 우선 풀스택 React** `growing` ⚠️
  정정: 2025-09 v1.0 RC, **2026-03 정식 stable**. "emerging/RC"가 아니라 채택 확산 단계. 타입 안전 파일 라우팅, isomorphic server functions, 배포 비종속. 한계: v1.0에 RSC 미포함.
- **프레임워크 시장 성숙·정체('바이브 시프트')** `mainstream` ✅
  State of JS 2025: "잦은 교체" 서사 종료, 경쟁 무게중심이 코어→메타프레임워크·빌드도구로 이동. **톤 시사점: "하이프" 아닌 "프로덕션 검증".**
- ➕ **Vite 8 + Rolldown(Rust 번들러) stable** — 2026-03-12 정식. esbuild+Rollup 이중구조를 단일 통합 번들러로 대체. (리서치 최대 빈틈이었음)
- ➕ **Next.js 16 `middleware.ts` → `proxy.ts` 전환** — Node 런타임 고정. `next/image`·async params 등 breaking changes.
- ➕ **프레임워크의 AI/LLM 통합** — Next.js 16 DevTools MCP 기반 AI 디버깅 1급 탑재.

### 업계 표준·베스트프랙티스
- Next.js 16: `cacheComponents: true` + `'use cache'` 명시적 옵트인. 무효화는 SWR=`revalidateTag(tag,'max')`, 즉시 반영=`updateTag()`, 비캐시=`refresh()`.
- `middleware.ts` 대신 `proxy.ts`(Node 런타임). `params`/`searchParams`/`cookies()`/`headers()`는 모두 `async await`.
- 메타프레임워크는 용도로 선택: 콘텐츠/마케팅=Astro, 풀스택 타입안전·클라이언트 우선=TanStack Start, React 표준 SSR=React Router 7 또는 Next.js App Router.
- 초기 로드는 스트리밍 SSR + Suspense + PPR(정적 셸 + 동적 부분) 기본.
- Turbopack/Vite 8(Rolldown) 기본, webpack 커스텀은 마이그레이션 대상.

### 핵심 용어 (영 / 한)
RSC=리액트 서버 컴포넌트 · Cache Components=캐시 컴포넌트 · `use cache` 디렉티브 · PPR=부분 프리렌더링 · Streaming SSR=스트리밍 SSR · Server Islands=서버 아일랜드 · Server Actions=서버 액션 · Server/Remote Functions=서버/리모트 함수 · Fine-grained reactivity=파인그레인드 반응성 · Signals=시그널 · Runes=룬즈 · React Compiler=리액트 컴파일러 · read-your-writes(자기 쓰기 즉시 반영) · isomorphic server functions=동형 서버 함수 · zoneless=존리스 · Model-First Development=모델 우선 개발

### 추천 출처
- Next.js 16 — https://nextjs.org/blog/next-16
- Cache Components — https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
- React 19.2 — https://react.dev/blog/2025/10/01/react-19-2
- React Compiler 1.0 — https://react.dev/blog/2025/10/07/react-compiler-1
- State of JS 2025 — https://2025.stateofjs.com/en-US/libraries/meta-frameworks/
- TanStack Start v1 — https://tanstack.com/blog/announcing-tanstack-start-v1
- Svelte Runes — https://svelte.dev/blog/runes

---

## 2. 프론트엔드 — 툴링 / 성능 / 품질

### 핵심 트렌드
- **Rust/Go 기반 네이티브 툴체인 대전환** `growing` ✅
  TypeScript 7.0(Project Corsa): 컴파일러를 Go로 재작성, tsc 대비 ~10배(2026-04 베타). Vite+Rolldown+Oxc 통합 툴체인. ⚠️ "Turborepo Go→Rust"는 2024-02 건으로 신규 트렌드로 묶기엔 stale.
- **Vite 사실상 표준화 + Rolldown 통합** `mainstream` ⚠️
  Vite 8(2026-03-12 정식)부터 Rolldown 기본. 사용률 Webpack에 근접/추월 직전. (정정: "Vite 8 베타에서 기본" → 정식 출시 완료)
- **INP가 Core Web Vitals 핵심 지표로 정착(FID 대체)** `mainstream` ✅
  2024-03 FID 대체. **양호 200ms 이하**, 2026년 약 43%가 미통과(가장 자주 실패). 최적화: 롱태스크 분할, JS 지연/분할, 서드파티 제어.
- **Tailwind v4 + shadcn/ui가 React 디자인 시스템 사실상 표준** `mainstream` ✅
  Tailwind v4: 설정을 CSS로 이동, CSS 변수·컨테이너 쿼리 네이티브. shadcn/ui: "코드를 복사해 소유"하는 모델 + `data-slot`.
- **상태관리 서버/클라이언트 분리 + 경량 스토어** `mainstream` ✅
  서버 상태=TanStack Query, 클라이언트=Zustand(Redux 추월). 일반 조합 **TanStack Query + Zustand + React Hook Form**.
- **Vitest 4 Browser Mode 정식화** `growing` ✅
  2025-10-22 Browser Mode stable. 내장 비주얼 리그레션, Playwright 트레이스 연동. 단위·컴포넌트·비주얼을 단일 러너 통합. (E2E는 여전히 Playwright 영역)

### 업계 표준·베스트프랙티스
- 모노레포는 Turborepo, 빌드는 Vite 8(Rolldown)/Turbopack. TS는 7.0(Corsa) 마이그레이션 주시.
- 성능 KPI는 INP 200ms 이하를 1차 목표로, 롱태스크 분할·코드 스플리팅·서드파티 통제.
- 디자인 시스템은 Tailwind v4 + shadcn/ui(소유형) 기본.
- 상태는 서버/클라이언트 분리: 서버 데이터=TanStack Query, 전역 클라이언트=Zustand, 폼=React Hook Form.
- 테스트는 Vitest(단위·컴포넌트) + Playwright(E2E) 조합.

### 핵심 용어
Project Corsa(TS 7 Go 컴파일러) · Rolldown · Oxc · INP(Interaction to Next Paint) · Core Web Vitals · Tailwind v4 · shadcn/ui · `data-slot` · TanStack Query · Zustand · Vitest Browser Mode · Visual regression=비주얼 리그레션

### 추천 출처
- TypeScript Go(Corsa) — https://devblogs.microsoft.com/typescript/typescript-native-port/
- Vite 8 / Rolldown — https://vite.dev/blog/
- web.dev INP — https://web.dev/articles/inp
- Tailwind v4 — https://tailwindcss.com/blog/tailwindcss-v4
- shadcn/ui — https://ui.shadcn.com/
- Vitest 4 — https://vitest.dev/blog/
