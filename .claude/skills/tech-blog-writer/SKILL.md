---
name: tech-blog-writer
description: Use when the user wants to write or publish a Korean tech blog post for Hooneylog — interviews the author for real experience, drafts in standard Korean tech-blog tone (frontend/backend/AI·RAG), lightly fact-checks, and publishes to Notion on approval. Triggers on "기술블로그 써줘", "블로그 글 써줘", "글 발행" and similar.
---

# Tech Blog Writer (Hooneylog)

한국어 기술블로그 글을 인터뷰형으로 작성하고 Notion DB에 발행하는 스킬.

## 핵심 원칙
- **진정성 우선**: 글쓴이의 실제 경험·의사결정·시행착오에서 출발한다. 일반론·AI 슬롭 금지.
- **표준 톤**: 존댓말('~습니다'), 겸손, 두괄식, 회고형. 상세 규칙은 `references/korean-writing.md`를 반드시 로드해 따른다.
- **사실은 검증**: 레퍼런스는 방향성, 최신 버전·수치·API는 웹으로 확인 후 기재.

## 워크플로 (순서대로)

### 1. 주제 파악 & 카테고리 판별
- 사용자가 주제를 안 줬으면 무엇에 대해 쓸지 묻는다.
- 내용으로 카테고리를 **정확히 하나** 고른다: `Frontend` / `Backend` / `Artificial Intelligence`.

### 2. 레퍼런스 로드
- 항상 `references/korean-writing.md`를 읽는다.
- 카테고리에 맞는 파일을 읽는다: Frontend→`references/frontend.md`, Backend→`references/backend.md`, Artificial Intelligence→`references/ai-rag.md`.

### 3. 인터뷰 (한 번에 하나씩, 3~6개)
실제 경험을 끌어내는 질문을 하나씩. 답을 듣고 다음 질문을 적응적으로 정한다:
- 무엇을 만들었거나 다뤘나? (구체적 상황)
- 왜 했나 / 어떤 문제가 있었나?
- 어디서 막혔나, 어떤 시행착오·대안 비교가 있었나?
- 어떻게 해결했나? (핵심 코드/설정)
- 무엇을 배웠나 / 독자에게 줄 TIP은?

충분한 재료가 모이기 전엔 초안을 쓰지 않는다.

### 4. 초안 작성
회고형 구조로 한국어 초안을 쓴다:
1. **제목 후보 2~3개** — SEO 키워드 + 질문형/구체형.
2. **TL;DR** — 3~4줄 요약.
3. **문제 정의** — 맥락과 왜.
4. **해결 과정 · 시행착오** — 추정→소거→검증의 사고 과정, 실패 포함. 필요한 곳에 코드 블록.
5. **결론**.
6. **독자 TIP / 한계**.
- 분량은 스캔 가능하게. 너무 길면 분할을 제안한다.
- 톤·문장 규칙은 `references/korean-writing.md`를 그대로 적용(번역투·이중피동 제거, 능동태, 두괄식).

### 5. 경량 웹 검증
- 초안에 등장하는 **버전 번호·수치·API 이름·릴리스 날짜**만 추출한다.
- 웹 검색으로 2026 현재 사실인지 확인하고, 틀린 것은 초안에서 인라인 수정한다.
- 확신이 안 서는 항목은 사용자에게 표시해 알린다.

### 6. 대화 내 검토 (발행 게이트)
완성 초안과 함께 발행 메타데이터를 제시하고 승인/수정을 받는다:
- 제목(택1), category(3대 중 1), tags(가능하면 기존 태그 재사용), description(한 줄 요약).
- 사이트는 published 글을 즉시 공개하므로, 이 단계가 마지막 검토 지점이다.

### 7. 발행
사용자가 승인하면:
1. 임시 입력 파일을 만든다 (레포 루트 기준 예: `.tmp-post.json`):
   ```json
   { "title": "...", "category": "Frontend", "tags": ["..."], "description": "...", "markdown": "<본문 마크다운>", "status": "published" }
   ```
   - `markdown`에는 제목 후보/TL;DR 라벨이 아니라 **발행 본문**만 넣는다(H1 제목은 Notion title이 담당하므로 본문 최상단 H1은 생략 가능).
2. 레포 루트에서 실행한다:
   ```bash
   node .claude/skills/tech-blog-writer/scripts/publish_to_notion.js .tmp-post.json
   ```
   - 의존성 미설치 시 먼저 `(cd .claude/skills/tech-blog-writer/scripts && npm install)`.
3. 출력된 `{ id, url }`의 URL을 사용자에게 전달한다.
4. 임시 입력 파일을 삭제한다.

## 제약
- category는 반드시 `Frontend` / `Backend` / `Artificial Intelligence` 중 하나.
- status 기본값 `published` (검토 후 공개를 원하면 `ready`로 발행 후 Notion에서 전환 가능).
- 비밀키는 절대 출력하지 않는다. 인증은 `apps/web/.env.local`에서 자동 로드된다.
- 새 태그를 남발하지 말고 검토 단계에서 사용자에게 태그를 확정받는다.
