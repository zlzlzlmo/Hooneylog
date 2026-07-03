# tech-blog-writer 한국 시장 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tech-blog-writer` 스킬에 한국어 윤문 게이트와 한국 검색(네이버/구글/GEO/배포) 레퍼런스를 추가한다.

**Architecture:** 스킬 디렉토리(`.claude/skills/tech-blog-writer/`)의 마크다운만 편집한다. `korean-seo.md`를 신설하고, `SKILL.md` 워크플로에 윤문 패스·발행 후 배포 단계를 추가하며, `korean-writing.md`의 SEO/GEO 조각을 새 파일로 이관해 중복을 제거한다. 라이브 블로그 코드(`apps/web`)는 건드리지 않는다.

**Tech Stack:** Markdown (스킬 문서). 자동 테스트 없음 — 검증은 `grep`/육안.

## Global Constraints

- 편집 범위는 `.claude/skills/tech-blog-writer/` 내부로 한정. `apps/web` 등 제품 코드 변경 금지.
- 기존 톤 규칙(존댓말·두괄식·번역투 제거)과 환각 검증 정정 문구는 삭제·왜곡 금지.
- 네이버 Search Advisor 소유확인 메타태그를 `layout.tsx`에 넣지 않는다(별도 후속).
- 각 태스크는 독립 커밋으로 마무리한다. 커밋 메시지 말미:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- 스킬 파일이 참조하는 상대 경로 규칙(`references/<name>.md`)을 그대로 따른다.

---

### Task 1: `references/korean-seo.md` 신설

**Files:**
- Create: `.claude/skills/tech-blog-writer/references/korean-seo.md`

**Interfaces:**
- Produces: `references/korean-seo.md` — `SKILL.md`(Task 2)와 `korean-writing.md`(Task 3)가 이 경로를 참조한다. 최상위 H1은 `# 한국 검색·배포 레퍼런스 (2026)`.

- [ ] **Step 1: 파일 생성 — 아래 내용을 그대로 작성**

파일 `.claude/skills/tech-blog-writer/references/korean-seo.md`:

```markdown
# 한국 검색·배포 레퍼런스 (2026)

> tech-blog-writer 스킬이 **검토·발행 단계**에서 로드하는 한국 검색/배포 지침.
> 톤·구조는 `korean-writing.md`, 검색·배포·GEO는 이 파일이 담당한다.
> ⚠️ 구체 수치·URL·정책은 발행 전 경량 웹 검증 단계로 확인할 것(2026-07 스냅샷).

## 전제: 이 블로그는 자체 Next.js 사이트다

Hooneylog는 네이버 블로그가 아니라 **자체 도메인 Next.js 사이트**다. 따라서:
- 네이버는 자사 플랫폼(네이버 블로그/카페/지식iN)을 우선 노출하고 외부 사이트 색인·노출에 보수적이다.
- 기술 SEO 토대(robots.ts·sitemap.ts·feed.xml·opengraph-image·generateMetadata·JSON-LD BlogPosting)는 **이미 구현돼 있다.** 글쓰기 단계에서 새로 코드를 만들 필요는 없다.
- 그러므로 전략은 "네이버 상위노출 집착"이 아니라 **구글/AI검색 최적화 + 등록·배포로 유입 경로 다변화**다.

## 네이버 현실 (C-Rank / D.I.A.)

- **C-Rank**: 출처(도메인)의 주제 집중도·인기를 본다. 외부 신생 도메인은 불리 → 단기 상위노출 기대는 낮게 잡는다.
- **D.I.A. / D.I.A.+**: 문서 자체 품질(정보성·경험·체류·클릭)을 평가. 신선도와 실제 사용자 반응을 중시.
- **키워드 스터핑 역효과**: 반복은 저품질 신호. 의미 중심으로 자연스럽게.
- **실행(사용자 몫)**: [네이버 서치어드바이저](https://searchadvisor.naver.com/)에 사이트 등록 → 사이트맵(`/sitemap.xml`)·RSS(`/feed.xml`) 제출 → 소유확인. (소유확인 메타태그 삽입은 코드 작업이라 별도 후속)

## 글쓰기 관점 실행 지침

- **제목 ~40자 이내**: 네이버·구글 SERP 잘림 회피. 핵심 키워드를 앞쪽에.
- **첫 문단에 핵심 키워드 자연스럽게**: 도배 아님. TL;DR이 곧 키워드 문단이 되도록.
- **H 태그 계층**: H1은 1개(제목), 본문은 H2/H3로 논리 구조. 검색엔진·AEO 스니펫 추출에 유리.
- **description(한 줄 요약)**: 검색결과 스니펫·OG로 노출됨. 키워드 + 후킹을 겸하게.
- **이미지 alt·코드블록 언어 명시**: 접근성 + 색인 보조.

## 구글 (이미 구현됨 — 유지·강화)

- JSON-LD BlogPosting, Open Graph, sitemap, canonical(alternates)은 코드에 이미 있음 → 새로 만들지 말 것.
- 글 관점 강화 포인트만: 정확한 제목/description, H 구조, 내부 링크(관련 글 연결).

## GEO / AEO (생성형·답변 엔진 최적화)

> AI 검색(ChatGPT/Perplexity/구글 AI Overview)이 인용하도록 쓰는 법. SEO만으론 구버전 프레이밍.

- **인용 가능성**: 통계·수치엔 **출처·조사 방법·데이터 기준일**을 붙인다(추적 가능성).
- **요약 문단**: 각 섹션 초입에 한두 문장 결론(두괄식) → 답변 엔진이 그대로 발췌하기 좋음.
- **E-E-A-T**: 실제 경험(Experience)·재현 절차·실패 로그가 차별점. AI가 쉽게 못 만드는 1차 경험을 전면에.
- **질문형 소제목**: 사용자 질의와 매칭되는 H2("왜 X가 느렸나?" 등).

## 발행 후 배포 체크리스트

자체 사이트의 초기 유입은 검색이 아니라 **배포**에서 나온다. 발행 직후:

- [ ] [GeekNews(긱뉴스)](https://news.hada.io/) 제출 — 개발자 유입 1순위.
- [ ] 커뮤니티 공유: 커리어리, OKKY, 관련 오픈채팅/디스코드/슬랙.
- [ ] 자체 채널 확인: `/feed.xml` RSS 정상 갱신, OG 카드(링크 미리보기) 렌더 확인.
- [ ] (선택) 네이버 서치어드바이저에서 수집 요청, 구글 서치콘솔 색인 요청.
- ⚠️ 과도한 자기홍보·도배는 커뮤니티 역효과. 글 1편당 채널당 1회, 맥락 있게.

## 추천 출처 (1차)

- 네이버 서치어드바이저 — https://searchadvisor.naver.com/
- 네이버 검색 웹 가이드(공식) — https://searchadvisor.naver.com/guide
- 구글 검색 센트럴 — https://developers.google.com/search
- GeekNews — https://news.hada.io/
```

- [ ] **Step 2: 생성 검증**

Run: `ls -la .claude/skills/tech-blog-writer/references/korean-seo.md && head -1 .claude/skills/tech-blog-writer/references/korean-seo.md`
Expected: 파일 존재, 첫 줄 `# 한국 검색·배포 레퍼런스 (2026)`.

- [ ] **Step 3: 링크·경로 정합성 검증**

Run: `grep -n "searchadvisor.naver.com\|news.hada.io\|korean-writing.md" .claude/skills/tech-blog-writer/references/korean-seo.md`
Expected: 서치어드바이저·긱뉴스 URL과 korean-writing.md 상호참조가 각각 최소 1회 등장.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/tech-blog-writer/references/korean-seo.md
git commit -m "feat(skill): tech-blog-writer 한국 검색·배포 레퍼런스 신설

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `SKILL.md` — 윤문 패스·발행 후 배포 단계 추가 & korean-seo 로드 명시

**Files:**
- Modify: `.claude/skills/tech-blog-writer/SKILL.md`

**Interfaces:**
- Consumes: `references/korean-seo.md`(Task 1).
- Produces: 갱신된 워크플로 번호 체계 — `5. 경량 웹 검증 → 6. 윤문 패스 → 7. 대화 내 검토 → 8. 발행 → 9. 발행 후 배포`.

- [ ] **Step 1: 레퍼런스 로드 지침 갱신 (`### 2. 레퍼런스 로드`)**

기존 블록:

```markdown
### 2. 레퍼런스 로드
- 항상 `references/korean-writing.md`를 읽는다.
- 카테고리에 맞는 파일을 읽는다: Frontend→`references/frontend.md`, Backend→`references/backend.md`, Artificial Intelligence→`references/ai-rag.md`.
```

다음으로 교체:

```markdown
### 2. 레퍼런스 로드
- 항상 `references/korean-writing.md`를 읽는다(톤·구조).
- 카테고리에 맞는 파일을 읽는다: Frontend→`references/frontend.md`, Backend→`references/backend.md`, Artificial Intelligence→`references/ai-rag.md`.
- 검토·발행 단계에서 `references/korean-seo.md`를 읽는다(제목 길이·네이버/구글/GEO·발행 후 배포).
```

- [ ] **Step 2: 윤문 패스 단계 삽입 — 기존 `### 5. 경량 웹 검증`과 `### 6. 대화 내 검토(발행 게이트)` 사이**

기존 `### 5. 경량 웹 검증` 블록 바로 뒤, 기존 `### 6. 대화 내 검토(발행 게이트)` 앞에 다음을 삽입한다:

```markdown
### 6. 윤문 패스 (AI 티 제거)
초안이 사실 검증까지 끝나면, 발행 전에 한국어 윤문 게이트를 거친다:
1. `ai-slop-reviewer` 스킬로 일반 기계패턴(AI 슬롭)을 1차 점검한다.
2. `humanize-korean` 스킬로 한국어 번역투·피동·병렬 남용 등을 2차 정밀 윤문한다.
- **강제 재작성이 아니라 리뷰**: 감지된 AI 티만 표시하고 저자 확인 후 반영한다. 이미 톤을 맞춰 썼다면 대부분 통과한다.
- **보존**: 두 스킬은 고유명사·수치·날짜·인용을 보존하고 변경률이 크면 경고·중단한다. **코드 블록·버전 수치·인용은 윤문 대상에서 제외**한다(5단계에서 검증한 값 보호).
- 판단 기준은 `references/korean-writing.md`의 톤 규칙이다.
```

- [ ] **Step 3: 이후 단계 번호 재정렬**

기존 `### 6. 대화 내 검토(발행 게이트)` → `### 7. 대화 내 검토(발행 게이트)`,
기존 `### 7. 발행` → `### 8. 발행` 으로 헤딩 번호만 바꾼다(본문 내용은 유지).

- [ ] **Step 4: 발행 후 배포 단계 추가 — `### 8. 발행` 블록 끝, `## 제약` 섹션 앞**

`### 8. 발행` 블록의 마지막 항목(임시 파일 삭제) 뒤에 다음 단계를 추가한다:

```markdown
### 9. 발행 후 배포
발행 URL을 받은 뒤, `references/korean-seo.md`의 "발행 후 배포 체크리스트"를 사용자에게 제시한다:
- GeekNews(긱뉴스) 제출, 커뮤니티(커리어리/OKKY 등) 공유, `/feed.xml`·OG 카드 렌더 확인.
- (선택) 네이버 서치어드바이저 수집 요청, 구글 서치콘솔 색인 요청.
- 채널당 1회·맥락 있게. 도배 금지.
```

- [ ] **Step 5: 워크플로 정합성 검증**

Run: `grep -n "^### [0-9]" .claude/skills/tech-blog-writer/SKILL.md`
Expected: 1~9 단계가 순서대로 유일하게 출력됨(중복 번호 없음). 6=윤문 패스, 9=발행 후 배포.

Run: `grep -n "korean-seo.md\|ai-slop-reviewer\|humanize-korean" .claude/skills/tech-blog-writer/SKILL.md`
Expected: korean-seo.md 로드 지침, 윤문 스킬 두 개가 각각 등장.

- [ ] **Step 6: 커밋**

```bash
git add .claude/skills/tech-blog-writer/SKILL.md
git commit -m "feat(skill): tech-blog-writer 워크플로에 윤문 패스·발행 후 배포 단계 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `korean-writing.md` — GEO/AEO 조각 이관 & 윤문 링크

**Files:**
- Modify: `.claude/skills/tech-blog-writer/references/korean-writing.md`

**Interfaces:**
- Consumes: `references/korean-seo.md`(Task 1)로 GEO/AEO·SEO 내용을 이관.

- [ ] **Step 1: 제목 섹션의 GEO/AEO 보강 조각을 korean-seo로 위임**

기존 `### 제목` 블록의 2번째 불릿:

```markdown
- ➕ **2026 보강: GEO/AEO(생성형·답변 엔진 최적화).** AI 검색(ChatGPT/Perplexity)이 인용하도록 통계·조사 방법·데이터 출처를 명시(추적 가능성), E-E-A-T 강화. SEO만으론 구버전 프레이밍.
```

다음으로 교체(중복 방지, 단일 출처화):

```markdown
- ➕ **검색·GEO/AEO는 `references/korean-seo.md` 참조**(제목 길이·네이버/구글·AI 검색 인용 최적화). 톤 가이드는 검색 규칙을 중복 기술하지 않는다.
```

- [ ] **Step 2: '2026 보강 관행'의 AI 슬롭 항목에 윤문 게이트 링크 추가**

기존 `### ➕ 2026 보강 관행` 블록의 첫 불릿:

```markdown
- **AI 슬롭 회피**: AI 과의존으로 인한 일반론·환각 문장 경계. AI 사용 시 사람의 회고·검증 책임 명시.
```

다음으로 교체:

```markdown
- **AI 슬롭 회피**: AI 과의존으로 인한 일반론·환각 문장 경계. AI 사용 시 사람의 회고·검증 책임 명시. 발행 전 워크플로 6단계(윤문 패스)에서 `ai-slop-reviewer`→`humanize-korean`로 기계패턴을 제거한다.
```

- [ ] **Step 3: 중복 제거 검증**

Run: `grep -c "GEO/AEO" .claude/skills/tech-blog-writer/references/korean-writing.md`
Expected: `핵심 용어` 줄에 남은 참조를 포함해 과다 중복이 없도록 확인(제목 섹션의 상세 GEO 설명은 사라지고 korean-seo 위임 문구로 대체됨).

Run: `grep -n "korean-seo.md\|윤문 패스" .claude/skills/tech-blog-writer/references/korean-writing.md`
Expected: korean-seo.md 위임 문구와 윤문 패스 링크가 각각 등장.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/tech-blog-writer/references/korean-writing.md
git commit -m "refactor(skill): korean-writing에서 GEO/SEO를 korean-seo로 이관, 윤문 링크 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 워크플로 드라이런 검증

**Files:** 없음(읽기 전용 확인).

- [ ] **Step 1: 전체 참조 그래프 확인**

Run: `ls .claude/skills/tech-blog-writer/references/` 로 `korean-seo.md` 존재 확인,
그리고 `grep -rn "korean-seo.md" .claude/skills/tech-blog-writer/SKILL.md .claude/skills/tech-blog-writer/references/korean-writing.md` 로 양쪽에서 참조되는지 확인.
Expected: korean-seo.md 파일 존재 + SKILL.md·korean-writing.md 양쪽에서 최소 1회씩 참조.

- [ ] **Step 2: 단계 흐름 육안 드라이런**

`SKILL.md`를 처음부터 읽으며 1→9 단계가 논리적으로 이어지는지 확인한다:
주제파악(1) → 레퍼런스 로드(2) → 인터뷰(3) → 초안(4) → 경량 웹 검증(5) → 윤문 패스(6) → 대화 내 검토(7) → 발행(8) → 발행 후 배포(9).
category 제약과 발행 스크립트 경로(`node .claude/skills/tech-blog-writer/scripts/publish_to_notion.js`)가 그대로 유지됐는지 확인.

- [ ] **Step 3: 최종 상태 커밋 없음(모두 앞 태스크에서 커밋됨) — git 상태 확인**

Run: `git status --short .claude/skills/tech-blog-writer/`
Expected: 출력 없음(working tree clean).
```
