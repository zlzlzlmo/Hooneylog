# 설계: `tech-blog-writer` 스킬

- 작성일: 2026-06-17
- 상태: 승인됨 (구현 대기)
- 관련 문서: [`docs/research/tech-blog-trends-2026.md`](../../research/tech-blog-trends-2026.md)

## 목적

Hooneylog 프로젝트의 한국어 기술블로그 글을 작성·발행하는 Claude Code 스킬. 주제를 받아 **인터뷰형**으로 글쓴이의 실제 경험·의사결정 맥락·시행착오를 끌어낸 뒤, 한국 기술블로그 업계 표준 톤으로 회고형 초안을 작성하고, 핵심 기술 사실을 경량 웹 검증한 다음, 승인 시 Notion DB에 발행한다.

## 배경 / 제약

- 콘텐츠 파이프라인: Notion DB → Next.js 사이트 렌더링. 사이트는 `status=published`인 글을 즉시 공개한다.
- Notion DB 스키마(`HooneyLog`):
  - `이름` (title) — 글 제목
  - `category` (multi_select) — 사이트는 **첫 값만** 노출. 기존 옵션에 `Frontend`/`Backend`/`Artificial Intelligence` 존재(+ 옛 항목 다수)
  - `tag` (multi_select) — 수백 개 세부 기술 태그 누적
  - `description` (rich_text) — 요약
  - `status` (select) — 옵션: `writing` / `ready` / `published`
  - `created_date` (created_time) — 자동
  - `image` (files), `slug` (rich_text, optional) — 이번 범위 제외
- 읽기 로직(`apps/web/src/lib/notion.ts`): `category.multi_select[0].name` 단일 카테고리 사용, 본문은 `notion-to-md`로 마크다운 변환.
- 인증: `apps/web/.env.local`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 설정·검증 완료. `.gitignore`로 제외됨.
- 루트 `node_modules` 미설치 상태.

## 확정된 요구사항 (브레인스토밍 결정)

| 항목 | 결정 |
|------|------|
| 입력 방식 | **인터뷰형** — 주제 → 질문으로 경험·맥락·시행착오 추출 → 회고형 초안 |
| 톤 | **연구 표준 톤만** — 존댓말, 겸손, 두괄식, `문제→시행착오→결론→TIP`, AI 슬롭 회피 (기존 글 분석 안 함) |
| 사실 검증 | **글마다 경량 검증** — 해당 글에 등장하는 버전·수치·API만 웹 확인 |
| 카테고리 | **3대 표준화** — `Frontend` / `Backend` / `Artificial Intelligence` 중 하나, 세부는 tag |
| 발행 | 대화 내 초안 승인 → Notion에 `status=published` 생성 (스크립트 인자로 변경 가능) |
| 구조 | **모듈형 스킬(progressive disclosure)** |

## 아키텍처

### 파일 구조
```
.claude/skills/tech-blog-writer/
├── SKILL.md                  # 트리거 + 워크플로 + 인터뷰 질문뱅크 + 톤 핵심규칙 + 발행 지침
├── references/
│   ├── korean-writing.md     # 한국어 작문 가이드 (연구 §7)
│   ├── frontend.md           # FE 트렌드/표준/용어/출처 (연구 §1·§2)
│   ├── backend.md            # BE 트렌드/표준/용어/출처 (연구 §3·§4)
│   └── ai-rag.md             # AI·RAG 트렌드/표준/용어/출처 (연구 §5·§6)
└── scripts/
    ├── publish_to_notion.js  # md → Notion 블록 + 페이지 생성
    └── package.json          # @notionhq/client, @tryfabric/martian
```

- `docs/research/tech-blog-trends-2026.md`를 영역별로 분할해 references로 재배치. 원본 문서는 유지.
- SKILL.md는 항상 로드 → 가볍게 유지. 카테고리별 reference는 글 작성 시에만 읽는다.

### 컴포넌트 책임

- **SKILL.md** — 워크플로 오케스트레이션. 인터뷰 질문뱅크, 톤 핵심 규칙(요약), 카테고리 판별 규칙, 발행 단계 지시. 상세 톤·트렌드는 references로 위임.
- **references/*.md** — 읽기 전용 지식. 작성 중 해당 카테고리 + 한국어 작문 가이드만 로드.
- **scripts/publish_to_notion.js** — 마크다운 + 메타데이터 → Notion 페이지 생성. 순수 변환 로직과 API 호출을 분리해 테스트 가능하게 작성.

## 워크플로 (데이터 흐름)

1. **트리거 & 주제 파악** — "기술블로그 써줘 [주제]" 등으로 진입. 주제 미제공 시 질문. 내용으로 카테고리(FE/BE/AI) 판별.
2. **레퍼런스 로드** — 해당 카테고리 reference + `korean-writing.md`.
3. **인터뷰** — 한 번에 하나씩, 3~6개 적응형 질문: 무엇을 / 왜·어떤 문제 / 막힌 지점·시행착오·대안 비교 / 해결 방법·코드 / 배운 것·TIP.
4. **초안 작성** — 회고형 구조: `제목 후보(SEO+질문형) → TL;DR → 문제 정의 → 해결 과정·시행착오 → 결론 → 독자 TIP`. 표준 톤. 필요 시 코드 블록. 분량은 스캔 가능하게(과도하게 길면 분할 제안).
5. **경량 웹 검증** — 초안 속 버전·수치·API만 추출해 웹 확인 → 틀린 것 인라인 수정, 불확실 항목 표시. (레퍼런스는 방향성, 최신 사실은 검증으로 보완)
6. **대화 내 검토** — 완성 초안 + 제안 메타데이터(제목/category/tags/description) 제시 → 사용자 수정 반복. 노출은 즉시이므로 이 단계가 검토 게이트.
7. **발행** — 승인 시 `publish_to_notion.js` 실행 → Notion 페이지 생성(`status=published`) → 생성된 페이지 URL 반환.

## 발행 스크립트 상세

- **입력**: 임시 JSON 파일 경로를 인자로 받음 — `{ title, category, tags[], description, markdown, status }`. 비밀키·본문을 셸 인자로 노출하지 않는다.
- **변환**: 마크다운 → Notion 블록은 `@tryfabric/martian`. 코드블록·헤딩·리스트·인용 처리. Notion 단일 요청 children 100개 제한 → 100개씩 분할하여 페이지 생성 후 `blocks.children.append`로 이어 붙인다.
- **속성 매핑**:
  - `이름` = title (title)
  - `category` = multi_select `[category]` (3대 중 1개)
  - `tag` = multi_select `[...tags]`
  - `description` = rich_text
  - `status` = select (기본 `published`, 인자로 `writing`/`ready` 가능)
  - `created_date` 자동, `image` 제외
- **태그 전략**: 기존 옵션과 대소문자까지 정확 일치 시 재사용, 없으면 신규(Notion 자동 생성). 무분별 신규 방지를 위해 검토 단계에서 태그를 사용자에게 확정받는다.
- **환경변수**: `apps/web/.env.local`의 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 로드.

## 의존성

- `scripts/package.json`에 `@notionhq/client`, `@tryfabric/martian`만 선언, 해당 디렉토리에서 `npm install` 1회. 모노레포 본체와 격리(루트 node_modules 미설치 상태 충돌 회피).

## 에러 처리

- 환경변수 누락 시 명확한 메시지로 즉시 중단.
- Notion API 오류(권한/속성 불일치/rate limit 429)는 메시지와 함께 실패 반환. 429는 짧은 백오프 재시도.
- 블록 변환 실패(지원 안 되는 마크다운) 시 해당 블록 스킵 + 경고 로그, 페이지 생성은 계속.
- 발행 부분 실패(페이지는 생성됐으나 일부 블록 append 실패) 시 생성된 페이지 URL과 실패 지점을 함께 보고.

## 테스트 (TDD)

- **순수 함수 단위 테스트** (Notion 클라이언트 mock):
  - ⓐ 속성 빌더: `{title, category, tags, description, status}` → Notion `properties` 객체 (필드명 `이름`/`category`/`tag`/`status` 정확성, multi_select 형태).
  - ⓑ 블록 변환 + 100개 초과 분할: N개 블록 입력 → 첫 100개는 생성 payload, 나머지는 append 청크로 분할.
- **통합 스모크 테스트** (수동/옵션): `status=writing`으로 실제 테스트 페이지 생성 → 확인 → archive/삭제. `published` 오염 없이 검증.
- **스킬 산문 드라이런**: 가짜 주제로 인터뷰→초안까지 돌려 구조·톤·검증 단계 점검.

## 범위 밖 (YAGNI)

- 기존 발행글 voice 학습 (표준 톤만 사용하기로 결정)
- 이미지(`image`)·슬러그(`slug`) 처리
- 별도 검증 서브에이전트 오케스트레이션 (경량 인라인 검증으로 충분)
- 기존 글 수정/업데이트 기능 (이번엔 신규 작성·발행만)
- 다국어/멀티플랫폼 발행

## 성공 기준

- "기술블로그 써줘 [주제]"로 진입 → 인터뷰 → 표준 톤 회고형 초안 → 경량 검증 → 승인 → Notion에 `published` 글 생성, 사이트에 정상 노출되고 마크다운/코드블록이 깨지지 않는다.
- 카테고리는 3대 중 하나로, 태그는 검토에서 확정된 값으로 들어간다.
- 발행 스크립트 단위 테스트 통과.
