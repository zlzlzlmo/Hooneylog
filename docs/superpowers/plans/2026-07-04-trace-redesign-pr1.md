# TRACE 리스킨 PR1 — 기반 + 전역 크롬 + 홈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hooneylog 블로그의 기반 토큰·폰트·전역 크롬·홈 화면을 TRACE(터미널 에디토리얼) 디자인으로 리스킨한다.

**Architecture:** `apps/web`의 표현층만 수정한다. `globals.css` 토큰 값 교체(이름 유지) + JetBrains Mono 주입 + 헤더를 상태바로 + 홈 목록을 "트레이스 레일 스트림"으로. 데이터/발행/서비스 로직(`lib`·`services`·`utils`·`api`)과 컴포넌트 props 계약은 무변경.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4(`@theme` 토큰), `next/font/google`, TypeScript, vitest. 시각 검증은 `webapp-testing`(Playwright) 스크린샷.

## Global Constraints

- 표현층만 수정: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/**`, `src/components/features/search.tsx`, `src/app/home-page-client.tsx`, `src/components/blocks/post-item-list.tsx`, `src/components/elements/{tag-list,author-badge,category-fallback-image}.tsx`. 그 외(`lib`·`services`·`utils`·`app/api`·데이터 fetch)는 **건드리지 않는다.**
- **Tailwind `@theme` 토큰 이름은 유지하고 값만 교체.** 기존 유틸(`bg-notion-bg`, `text-notion-text`, `text-notion-secondary`, `border-notion-border`, `bg-notion-hover`, `bg-notion-gray-bg`, `bg-accent`, `text-on-accent`, `ring-accent`, `font-mono`)이 계속 동작해야 한다. 신규 토큰만 추가(카테고리색).
- 다크모드는 기존 `.dark` 클래스 토글 구조(localStorage 'theme' 인라인 스크립트) 유지. 두 테마 동등 품질.
- 접근성: 키보드 포커스 가시화 유지, `prefers-reduced-motion` 존중, 카테고리색 텍스트는 각 배경에서 AA(4.5:1).
- 컴포넌트의 props 시그니처·데이터 소비 방식 변경 금지(로직 무변경, className/마크업만).
- 각 태스크 독립 커밋. 커밋 메시지 말미:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- 팔레트(라이트): ink `#12141A` · paper `#FAF9F5` · ash `#6B6E76` · amber(paper) `#C97E12` / amber(ink) `#E8A317` · fe `#2D6AE3` · be `#0B8F6C` · ai `#7C5CFC` · hairline `rgba(18,20,26,0.12)`.
- 팔레트(다크): bg `#0D0E12` · card `#14161C` · text `#E7E7E3` · ash `#8A8D95` · amber `#F0B33D` · fe `#6AA0FF` · be `#3FD6A6` · ai `#A98CFF` · hairline `rgba(255,255,255,0.11)`.

---

### Task 0: 브랜치 + 개발 서버 + 베이스라인 스크린샷

**Files:** 없음(환경 준비).

- [ ] **Step 1: feature 브랜치 생성**

Run: `cd /Users/seunghun/Documents/Hooneylog && git checkout main && git pull && git checkout -b feat/redesign-trace-pr1`
Expected: 새 브랜치로 전환.

- [ ] **Step 2: 개발 서버 기동**

Run: `pnpm --filter web dev` (백그라운드). 기본 포트 3000.
Expected: `Ready`. Notion 인증은 `apps/web/.env.local`에서 로드.

- [ ] **Step 3: 베이스라인 스크린샷 (webapp-testing)**

`webapp-testing` 스킬로 `http://localhost:3000/`(홈) 라이트/다크 스크린샷을 캡처해 리스킨 전 상태를 기록한다.
Expected: before 스크린샷 확보(회귀 비교용).

---

### Task 1: 디자인 토큰 교체 + JetBrains Mono 주입

**Files:**
- Modify: `apps/web/src/app/globals.css` (`@theme`, `:root`, `.dark` 블록)
- Modify: `apps/web/src/app/layout.tsx`

**Interfaces:**
- Produces: 신규 토큰 `--color-cat-fe/-be/-ai`(→ 유틸 `text-cat-fe`, `bg-cat-fe` 등), `--font-mono`가 JetBrains Mono로. 후속 태스크가 이 토큰을 사용.

- [ ] **Step 1: `globals.css`의 `@theme` 블록을 TRACE 값으로 교체(이름 유지 + 카테고리 토큰 추가)**

`@theme { ... }` 내부의 색/폰트 토큰을 다음으로 교체한다(container/breakpoint는 유지):

```css
@theme {
  --color-notion-bg: #FAF9F5;
  --color-notion-text: #12141A;
  --color-notion-text-light: #6B6E76;
  --color-notion-border: rgba(18, 20, 26, 0.12);
  --color-notion-hover: rgba(18, 20, 26, 0.06);
  --color-notion-gray-bg: #F1EFEA;
  --color-notion-blue-bg: #E7F0FB;
  --color-notion-blue-text: #2D6AE3;

  --container-max: 720px;
  --breakpoint-mobile: 768px;

  --font-sans: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Segoe UI', Roboto, 'Malgun Gothic', 'Noto Sans KR', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --font-serif: Georgia, 'Nanum Myeongjo', 'Apple SD Gothic Neo', serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;

  --color-accent: #C97E12;
  --color-accent-bg: #F6ECD9;
  --color-on-accent: #FFFFFF;

  --color-cat-fe: #2D6AE3;
  --color-cat-be: #0B8F6C;
  --color-cat-ai: #7C5CFC;
}
```

- [ ] **Step 2: `.dark` 블록을 TRACE 다크 값으로 교체**

`globals.css`의 `.dark { ... }` 내부 토큰을 다음으로 교체한다:

```css
.dark {
  --color-notion-bg: #0D0E12;
  --color-notion-text: #E7E7E3;
  --color-notion-text-light: #8A8D95;
  --color-notion-border: rgba(255, 255, 255, 0.11);
  --color-notion-hover: rgba(255, 255, 255, 0.06);
  --color-notion-gray-bg: #14161C;
  --color-notion-blue-bg: #17293D;
  --color-notion-blue-text: #6AA0FF;
  --color-accent: #F0B33D;
  --color-accent-bg: #2A2413;
  --color-on-accent: #0D0E12;
  --color-cat-fe: #6AA0FF;
  --color-cat-be: #3FD6A6;
  --color-cat-ai: #A98CFF;
}
```

- [ ] **Step 3: `layout.tsx`에 JetBrains Mono 주입**

`apps/web/src/app/layout.tsx` 상단 import에 추가하고 `<html>`에 variable 클래스를 붙인다:

```tsx
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
```

그리고 `<html lang="ko" suppressHydrationWarning>` 를
`<html lang="ko" suppressHydrationWarning className={jetbrainsMono.variable}>` 로 바꾼다.

- [ ] **Step 4: 빌드·타입 검증**

Run: `pnpm --filter web typecheck && pnpm --filter web build`
Expected: 통과. `next/font`가 JetBrains Mono를 빌드타임 셀프호스팅(런타임 외부요청 없음).

- [ ] **Step 5: 시각 검증 (webapp-testing)**

홈 라이트/다크 스크린샷 캡처. 배경이 따뜻한 종이/짙은 잉크로, 액센트가 amber로 바뀌었는지, 기존 `font-mono` 자리(카드 조회수/날짜 footer)가 JetBrains Mono로 렌더되는지 확인.
Expected: 색/폰트 전환 확인. 레이아웃 깨짐 없음.

- [ ] **Step 6: 커밋**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/layout.tsx
git commit -m "feat(web): TRACE 팔레트 토큰 교체 + JetBrains Mono 주입

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 헤더 → 상태바(statusbar)

**Files:**
- Modify: `apps/web/src/components/layout/header.tsx`

**Interfaces:**
- Consumes: `--font-mono`, 카테고리 토큰(Task 1). `ThemeToggle`(기존 컴포넌트) 재사용.

- [ ] **Step 1: `header.tsx`를 상태바 형태로 교체**

로고 배지+"HooneyLog"를 모노 브랜드(+깜빡 커서)로, 카테고리 nav(frontend/backend/ai, 각 hover 색)를 추가, 우측에 카테고리 nav + ThemeToggle을 둔다. 높이 46px, 모노 12.5px, hairline 하단 보더. 기존 sticky/backdrop/스킵 동작 유지:

```tsx
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/tag/frontend', label: 'frontend', cls: 'hover:text-cat-fe' },
  { href: '/tag/backend', label: 'backend', cls: 'hover:text-cat-be' },
  { href: '/tag/ai', label: 'ai', cls: 'hover:text-cat-ai' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[46px] bg-notion-bg/85 backdrop-blur-md border-b border-notion-border flex items-center gap-4 px-4 sm:px-6 font-mono text-[12.5px]">
      <Link
        href="/"
        className="flex items-center gap-[3px] font-semibold tracking-tight text-notion-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg rounded-[3px]"
      >
        hooneylog
        <span aria-hidden="true" className="inline-block w-[7px] h-[14px] bg-accent translate-y-[2px] motion-safe:animate-[blink_1.15s_steps(1)_infinite]" />
      </Link>
      <nav aria-label="카테고리" className="ml-auto flex items-center gap-5 text-notion-secondary">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`lowercase transition-colors ${n.cls}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
```

- [ ] **Step 2: `blink` 키프레임을 `globals.css`에 추가**

`globals.css`의 `@layer utilities` 근처(또는 파일 하단)에 추가:

```css
@keyframes blink { 50% { opacity: 0; } }
```

- [ ] **Step 3: 시각 검증**

Run: dev 서버 유지. 홈에서 헤더 라이트/다크 스크린샷.
Expected: 모노 브랜드 + 깜빡 커서(감소모션 시 정지), 우측 카테고리 nav hover 시 각 색, 테마 토글 정상. 46px 높이.

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/components/layout/header.tsx apps/web/src/app/globals.css
git commit -m "feat(web): 헤더를 모노 상태바로 리스킨

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 셸(app-layout · footer · theme-toggle) 정렬

**Files:**
- Modify: `apps/web/src/components/layout/app-layout.tsx`
- Modify: `apps/web/src/components/layout/footer.tsx`
- Modify: `apps/web/src/components/layout/theme-toggle.tsx`

**Interfaces:**
- Consumes: Task 1 토큰. AUTHOR(기존).

- [ ] **Step 1: `footer.tsx`를 모노 스타일로**

내용(© 연도·이름) 유지하되 모노 + 좌우 배치 프롬프트 표식으로 리스킨:

```tsx
import { AUTHOR } from '@/lib/author';

export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border mt-20 py-10 px-4 sm:px-6 font-mono text-[12px] text-notion-secondary flex flex-wrap items-center justify-between gap-3">
      <span><span className="text-accent">$</span> hooneylog — frontend · backend · ai</span>
      <span>© {new Date().getFullYear()} {AUTHOR.name} · <a href="/feed.xml" className="hover:text-notion-text transition-colors">RSS</a></span>
    </footer>
  );
}
```

- [ ] **Step 2: `theme-toggle.tsx` 포커스/호버 토큰 유지 확인 + 모노 정렬**

로직(마운트 가드·localStorage) **변경 없이**, 버튼 크기를 상태바(46px)에 맞춰 `w-9 h-9`→`w-8 h-8`로만 조정하고 나머지 클래스는 유지한다. (아이콘 Moon/Sun 유지)

Run(검증): `grep -n "localStorage\|classList.toggle" apps/web/src/components/layout/theme-toggle.tsx`
Expected: 토글 로직 그대로 존재.

- [ ] **Step 3: `app-layout.tsx` 스킵링크 토큰 정합**

`focus:bg-notion-text focus:text-white` → `focus:bg-notion-text focus:text-notion-bg` 로 바꿔 다크에서도 대비 유지. `max-w-[1392px]` 컨테이너는 유지(홈은 넓은 그리드, 포스트는 PR2에서 좁힘).

- [ ] **Step 4: 빌드·시각 검증**

Run: `pnpm --filter web build`
Expected: 통과. 푸터 모노, 스킵링크 다크 대비 확인(키보드 Tab).

- [ ] **Step 5: 커밋**

```bash
git add apps/web/src/components/layout/app-layout.tsx apps/web/src/components/layout/footer.tsx apps/web/src/components/layout/theme-toggle.tsx
git commit -m "feat(web): 셸(레이아웃·푸터·토글) TRACE 정렬

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 홈 인트로 + 사이드바 + 검색 리스킨

**Files:**
- Modify: `apps/web/src/app/home-page-client.tsx` (인트로 밴드 + 컨테이너 클래스만)
- Modify: `apps/web/src/components/layout/sidebar.tsx`
- Modify: `apps/web/src/components/features/search.tsx`

**Interfaces:**
- Consumes: Task 1 토큰. **로직(useFilterPost·상태·조회수 동기화·로드모어)·props 무변경.**

- [ ] **Step 1: `home-page-client.tsx` 인트로 밴드를 TRACE 리드로**

`return (...)` 내부의 인트로 `header`(줄 102~109 상당)만 아래로 교체한다. 리스트/사이드바/검색/로드모어 JSX와 모든 훅·핸들러는 **그대로 둔다**:

```tsx
      <header className="mb-8 lg:mb-10">
        <span className="font-mono text-[12.5px] text-notion-secondary tracking-[0.02em]">~/hooneylog — {AUTHOR.tagline}의 개발 로그</span>
        <h1 className="mt-2 text-2xl sm:text-[2rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-notion-text text-balance">
          막힌 지점부터 <span className="text-accent">되짚는</span> 기술 기록.
        </h1>
      </header>
```

- [ ] **Step 2: `sidebar.tsx` 리스킨 (카테고리 목록·통계)**

먼저 현재 코드를 읽는다(`sidebar.tsx`). 카테고리 필터 버튼과 통계 표시의 **로직·props·핸들러는 유지**하고, 클래스만 TRACE로:
- 카테고리 라벨은 `font-mono text-[12px]`, 선택 항목은 `text-notion-text`·비선택은 `text-notion-secondary`.
- 활성 카테고리 표식은 좌측 2px 카테고리색 바(예: `border-l-2` + 해당 색) 또는 `text-accent`.
- 통계 숫자는 `font-mono tabular-nums`.
- 포커스 링(`ring-accent`) 유지.

수용 기준: 카테고리 클릭 시 필터 동작 그대로, 시각만 모노/TRACE.

- [ ] **Step 3: `search.tsx` 리스킨**

먼저 현재 코드를 읽는다. 입력 로직·props 유지, 클래스만: 각진 테두리(`rounded-[4px]` 이하), `font-mono` placeholder(예: `> 검색…`), 포커스 시 `ring-accent`. hairline 보더.

- [ ] **Step 4: 시각·회귀 검증**

Run: dev 유지. 홈 라이트/다크 스크린샷 + 카테고리 클릭/검색 입력 상호작용 확인(webapp-testing).
Expected: 인트로 리드 문구, 사이드바 모노 필터 동작, 검색 동작. 조회수/로드모어 정상.

- [ ] **Step 5: 커밋**

```bash
git add apps/web/src/app/home-page-client.tsx apps/web/src/components/layout/sidebar.tsx apps/web/src/components/features/search.tsx
git commit -m "feat(web): 홈 인트로·사이드바·검색 TRACE 리스킨

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: post-item-list → 트레이스 스트림 (시그니처)

**Files:**
- Modify: `apps/web/src/components/blocks/post-item-list.tsx`
- Modify: `apps/web/src/components/elements/category-fallback-image.tsx` (썸네일 크기 대응 시)

**Interfaces:**
- Consumes: `NotionPost[]`, `viewsMap`, `query`, `onReset`(**props 그대로**). 카테고리 토큰.
- Produces: 홈 목록의 트레이스 레일 스트림. 빈 상태/onReset 동작 유지.

카테고리→색 매핑 헬퍼(파일 내부, 데이터 무변경):
- `Frontend`→`cat-fe`, `Backend`→`cat-be`, `Artificial Intelligence`/`AI`→`cat-ai`, 그 외→`accent`.

- [ ] **Step 1: 빈 상태 블록은 유지, 목록 컨테이너를 레일 스트림으로 교체**

`posts.length === 0` 분기(빈 상태 + onReset 버튼)는 **그대로 둔다**. 그 아래 `return (<div className="grid ...">...)` 를 좌측 레일 + 세로 스택 엔트리로 바꾼다. 각 엔트리는:
- 좌측 레일(컨테이너 `relative pl-8`, `::before`로 세로선) + 엔트리별 카테고리색 다이아몬드 노드(`absolute -left-8`, `rotate-45`, `border-2` 카테고리색, hover 시 채움+box-shadow).
- 모노 메타라인: `카테고리 · {readTime}min · {views} · {date}` (readTime이 데이터에 없으면 조회수/날짜만 — 기존 footer가 쓰던 `viewsMap[post.id]`·`formatDate(post.createdAt)` 사용).
- 한글 헤드라인 `h3`(hover 시 카테고리색), 한 줄 dek(`line-clamp-2`), 우측 작은 정사각 썸네일(72~88px, `getCategoryImageSrc` + `CategoryFallbackImage` 재사용, isDefault 분기 유지).
- 태그 칩은 PR1에서 생략 가능(태그는 tag-list에서 별도). 엔트리 전체가 `Link href={/post/${post.id}}`, 포커스 링 유지.

구현 시 목업(`scratchpad/trace-mockup.html`)의 `.entry`·`.node`·`.tick`·`.meta` 스타일을 Tailwind 유틸로 옮긴다. Tailwind로 표현이 어려운 레일 `::before`/노드 pseudo는 `globals.css`에 `.trace-rail`/`.trace-node` 유틸 클래스로 추가해도 된다.

- [ ] **Step 2: 반응형 확인**

모바일(≤640px): 썸네일 축소 또는 하단 배치, 레일 유지. 데스크톱: 사이드바와의 2열 레이아웃(home-page-client가 감쌈) 안에서 스트림이 단일 열로.

- [ ] **Step 3: 시각 반복(iterate) — 목업 대조**

`webapp-testing`으로 홈 스크린샷(라이트/다크/모바일)을 찍고 목업과 대조하며 간격·노드·hover를 맞춘다. hover/focus 시 노드 채움·헤드라인 색전환 확인. `prefers-reduced-motion`에서 등장 애니메이션 정지.
Expected: 트레이스 스트림이 목업 수준으로 렌더. 빈 상태·onReset·조회수·로드모어 회귀 없음.

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/components/blocks/post-item-list.tsx apps/web/src/components/elements/category-fallback-image.tsx apps/web/src/app/globals.css
git commit -m "feat(web): 홈 목록을 트레이스 레일 스트림으로 (시그니처)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: tag-list · author-badge 토큰 정렬

**Files:**
- Modify: `apps/web/src/components/elements/tag-list.tsx`
- Modify: `apps/web/src/components/elements/author-badge.tsx`

**Interfaces:**
- Consumes: Task 1 토큰. props 무변경.

- [ ] **Step 1: 각 파일을 읽고 클래스만 TRACE로**

먼저 두 파일을 읽는다. 로직·props 유지:
- `tag-list`: 태그 칩을 `font-mono text-[11px]`, 각진 hairline 보더(`border border-notion-border`), `#` 접두. hover 시 `bg-notion-hover`.
- `author-badge`: 아바타/이름 배치 유지, 텍스트 토큰 정합(`text-notion-secondary`), 필요 시 라벨 모노.

- [ ] **Step 2: 빌드·시각 검증**

Run: `pnpm --filter web build`
Expected: 통과. 태그/작성자 표시가 TRACE 토큰으로.

- [ ] **Step 3: 커밋**

```bash
git add apps/web/src/components/elements/tag-list.tsx apps/web/src/components/elements/author-badge.tsx
git commit -m "feat(web): 태그·작성자 요소 TRACE 토큰 정렬

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: PR1 검증 + PR 오픈

**Files:** 없음.

- [ ] **Step 1: 전체 검증 스위트**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build`
Expected: lint/typecheck clean, 기존 vitest 전부 pass, build 성공(SSG). 실패 시 STOP.

- [ ] **Step 2: 회귀 체크(webapp-testing, 라이트/다크/모바일)**

홈에서 확인: 카테고리 필터, 검색, 더보기(로드모어), 조회수 표시, 테마 토글, 헤더 nav, RSS 링크, 키보드 포커스 가시성. before/after 스크린샷 비교.
Expected: 기능 회귀 0, 시각은 TRACE로 전환.

- [ ] **Step 3: 푸시 + PR 생성**

```bash
git push -u origin feat/redesign-trace-pr1
gh pr create --title "feat(web): TRACE 리스킨 PR1 — 기반+크롬+홈" --body "$(cat <<'EOF'
## 요약
TRACE(터미널 에디토리얼) 리스킨 1단계: 디자인 토큰·JetBrains Mono·헤더 상태바·홈 트레이스 스트림.

## 변경
- globals.css 팔레트 토큰 교체(이름 유지) + 카테고리 토큰 신설
- JetBrains Mono 주입(next/font, 런타임 외부요청 없음)
- 헤더→모노 상태바, 푸터/셸 정렬
- 홈: 인트로 리드 + 사이드바/검색 리스킨 + 목록→트레이스 레일 스트림

## 불변
- 데이터/발행/서비스 로직 무변경(lib·services·utils·api), props 계약 유지
- Notion 발행·조회수·revalidate·RSS 그대로

## 검증
- lint/typecheck/test/build green, 라이트·다크·모바일 스크린샷 첨부, 회귀 없음

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: 브랜치별 Vercel 프리뷰 URL 생성 → 실데이터로 최종 확인 후 머지.
```
