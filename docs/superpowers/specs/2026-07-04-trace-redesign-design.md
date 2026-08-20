# TRACE 리스킨 — 디자인 설계

- 작성일: 2026-07-04
- 대상: `apps/web` 표현층(`src/components/**`, `src/app/**`의 뷰, `src/app/globals.css`, `src/app/layout.tsx`)
- 비대상: `lib/notion`·`services`·`utils`·`app/api/**` 등 데이터/백엔드 로직(무변경)

## 배경

Hooneylog(한국 개발자의 회고형 문제해결 기술블로그, Next.js 16 + Tailwind v4 + Notion CMS)의
UI를 "완전 개성 있게" 재설계한다. 데이터/표현층이 이미 깨끗이 분리돼 있어(페이지가 `lib/notion`에서
읽어 props로 컴포넌트에 전달), **리스킨 = `components/` + `globals.css` + `layout.tsx`만 수정**한다.
백엔드·발행 파이프라인(tech-blog-writer→Notion, 조회수 KV, revalidate, RSS)은 그대로 재사용된다.

선택된 방향: **TRACE — 터미널 에디토리얼.** 개발자의 "트레이스 로그" 은유. 과감함은 본문이 아니라
크롬(헤더·홈·TOC)에 싣고, 시그니처는 **트레이스 레일**이다. 목업으로 방향 확정됨.

## 목표

- 일관된 디자인 시스템(토큰·타입)을 `globals.css`에 정립하고 전 화면이 상속하게 한다.
- 시그니처(트레이스 레일)를 홈 스트림과 포스트 목차/진행에 구현한다.
- 데이터·발행 로직을 한 줄도 바꾸지 않는다. 다크모드·접근성·모션 접근성을 기존 수준 이상으로 유지.

## 비목표 (YAGNI)

- 독립 폴더/신규 앱 분리 — 불필요(오버킬). git 브랜치 + Vercel 프리뷰로 격리.
- 백엔드/서비스 어댑팅 — 표현층만 수정하므로 없음.
- 본문 한글 폰트 교체 — 가독성 위해 기존 시스템 산스 유지(Pretendard 선호 스택).
- 새 프레임워크/라우팅 구조 변경.

## 디자인 시스템

### 색 (globals.css `@theme` 토큰 리매핑, `.dark` 구조 유지)

라이트:

- `--ink #12141A` · `--paper #FAF9F5` · `--ash #6B6E76`
- 시그널 amber: 종이 위 텍스트용 `#C97E12`(AA), ink 그라운드 위 `#E8A317`
- 카테고리: fe `#2D6AE3` · be `#0B8F6C` · ai `#7C5CFC`
- hairline `rgba(18,20,26,0.12)`

다크:

- `--ink(bg) #0D0E12` · card `#14161C` · text `#E7E7E3` · `--ash #8A8D95`
- amber `#F0B33D` · fe `#6AA0FF` · be `#3FD6A6` · ai `#A98CFF`
- hairline `rgba(255,255,255,0.11)`

카테고리 색은 라이트/다크 양 배경에서 본문 대비 및 텍스트 사용 시 AA(4.5:1)를 만족하도록 채도/명도 조정.

### 타입 (3역할)

- **디스플레이/본문**: 기존 `--font-sans`(시스템 산스, 한글 Pretendard 선호) 유지. 헤드라인은 weight 750~800 + tracking `-0.02~-0.03em`, `text-wrap: balance`.
- **데이터/라벨/코드**: **JetBrains Mono** via `next/font/google`(빌드타임 셀프호스팅, 런타임 외부요청 없음, subset `latin`). `--font-mono`를 이 폰트로 교체. 메타라인·카테고리 라벨·상태바·코드블록·태그 칩에 사용.
- 스케일: base 16px, 헤드라인 `clamp()` 반응형, 메타 11.5px uppercase tracking `.04~.16em`.

## 시그니처: 트레이스 레일

과감함을 한 곳에 집중한다.

- **홈 스트림** (`post-item-list`): 왼쪽 2px 세로 레일 + 각 글의 카테고리색 다이아몬드 노드. 엔트리 =
  모노 메타라인(category · read · views · date) + 한글 헤드라인 + 한 줄 dek + 모노 태그 칩.
  hover/focus 시 노드 채움 + 가로 tick + 헤드라인 카테고리색. 페이지 로드 시 레일 draw + 엔트리 stagger(모션 접근성 존중).
- **포스트 목차** (`table-of-contents`): 레일형 목차. 스크롤 위치에 따라 노드가 채워지며 진행을 표현.
  `reading-progress`는 레일 상단/헤더의 얇은 진행바로 통합·정렬.

구조가 콘텐츠(문제해결 서사·카테고리)를 인코딩한다. 장식용 번호 마커는 쓰지 않는다.

## 영역별 처리 & 단계(PR) 매핑

**PR 1 — 기반 + 전역 크롬 + 홈**

- `globals.css` 토큰 교체, `layout.tsx`에 JetBrains Mono 주입.
- `layout/header`→상태바(모노 브랜드+커서, 카테고리 nav hover 색, search/theme 툴버튼), `footer`, `theme-toggle`, `app-layout`, `sidebar`, `features/search`.
- `home-page-client`, `post-item-list`→트레이스 엔트리, `tag-list`, `author-badge`, `category-fallback-image`.

**PR 2 — 포스트 상세**

- `post-header`, `table-of-contents`→트레이스 레일, `markdown-renderer`(프로즈 스타일: 타이포·코드·인용·표·KaTeX), `code-block`/`copy-button`, `reading-progress`, `related-posts`, `share-buttons`, `view-counter`, `back-to-top`.

**PR 3 — 태그 페이지 + 롱테일**

- `app/tag/[tag]/page.tsx`, `giscus-comment`/`facebook-comment`(테마 토큰 연동), `mermaid`(테마), `move-to-another-post`.

## 불변 제약 (Global Constraints)

- `lib/notion`·`services`·`utils`·`app/api/**`·데이터 fetch·props 계약 **무변경**. 컴포넌트의 데이터 소비 시그니처 유지.
- 다크모드: `.dark` 토글 구조 유지, 두 테마 동등 품질(단순 반전 금지).
- 접근성 바닥: 키보드 포커스 가시화, `prefers-reduced-motion` 존중, 카테고리색 텍스트 AA.
- Next.js 16 / React 19 / Tailwind v4 / Node >=20.9 유지. 새 런타임 의존성은 `next/font`(JetBrains Mono)뿐.
- 각 PR은 기능 회귀 없이 독립 배포 가능해야 한다.

## 검증 방법

- 각 PR: `pnpm --filter web check`(lint·typecheck·build) green + 기존 vitest 통과.
- `webapp-testing`(Playwright)로 라이트/다크 주요 화면(홈·포스트·태그) 스크린샷 캡처·육안 확인.
- Vercel 브랜치 프리뷰 URL로 실데이터 렌더 확인 후 머지.
- 회귀 체크: 조회수 증가, 댓글 로드, RSS/sitemap 응답, 다크 토글, 반응형(모바일).

## 리스크

- 카테고리색 대비 미달 → 토큰 확정 시 대비 계산으로 방어, 텍스트엔 darkened 변형 사용.
- 프로즈(markdown-renderer) 리스타일이 KaTeX/mermaid/코드 하이라이트와 충돌 → PR 2에서 스코프 좁혀 개별 확인.
- Tailwind v4 `@theme` 토큰명 변경 시 기존 유틸리티 클래스 참조 깨짐 → 토큰명은 유지하고 값만 교체하거나, 변경 시 전역 grep로 참조 갱신.
