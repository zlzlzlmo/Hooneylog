# 설계: HooneyLog 자동 트렌드 발행 봇 (trend-writer)

- 작성일: 2026-07-04
- 상태: 승인 대기
- 배포 타깃: GCP (Cloud Run Job + Cloud Scheduler)

## 1. 목적

프론트엔드 / 백엔드 / AI 드리븐 웹개발의 최신 동향을 **주 2–3회 자동으로 조사·집필·발행**하는 봇. 인터뷰형이 아니라 **지식 전파형** 글로, 작성자(Hooney) 본인의 학습 자료로도 쓸 수 있게 근거 출처를 노출한다. 모든 사실은 **Google Search 그라운딩**으로 검증해 할루시네이션을 차단한다.

### 비목표 (YAGNI)

- 대량 발행 (회당 1글 상한)
- 인터뷰/개인 경험 기반 서술 (기존 `tech-blog-writer` 스킬의 영역)
- 이미지 생성, 썸네일 자동화 (1차 범위 밖)
- 웹 UI 변경 (기존 카테고리/태그 렌더링을 그대로 사용)

## 2. 핵심 결정 (브레인스토밍 확정)

| 항목 | 결정 |
|---|---|
| 생성 엔진 | **Gemini 단독** — Google Search 그라운딩으로 조사+집필 |
| 주제 선정 | **자율 트렌드 스캔** — 매 회차 검색 후 Notion 기존 글과 중복 제거 |
| 발행 주기 | **주 2–3회** (Cloud Scheduler cron, 예: 월·수·금 09:00 KST) |
| AI 표기 | **전용 카테고리("AI 트렌드") + 출처 링크** — 마치며에 AI 생성 안내 + 인용 URL |
| 안전장치 | **자가검증 게이트** — 통과 시 published, 실패 시 draft + 알림 |
| 문체 품질 | `blog-writer` 6단 양식 + `humanize-korean`/`ai-slop-reviewer` 룰북 이식 |

## 3. 아키텍처 (GCP)

프로비저닝·배포는 **GCP MCP (`mcp__gcloud__run_gcloud_command`)**로 수행한다.

| 구성 요소 | 선택 | 역할 |
|---|---|---|
| 실행 | **Cloud Run Job** | 배치 작업(끝나면 종료). 회당 수 초~수십 초 |
| 스케줄 | **Cloud Scheduler** | cron 트리거 → Cloud Run Job 실행 |
| 비밀 | **Secret Manager** | `GEMINI_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTIFY_WEBHOOK_URL`(선택) |
| 이미지 | **Artifact Registry** | 컨테이너 이미지 저장 |
| 코드 위치 | 모노레포 신규 앱 **`apps/trend-writer`** | Notion 스키마·발행 로직 공유, 배포 타깃만 GCP |
| 런타임 | **Node.js 20+** | 기존 `@notionhq/client` + `@tryfabric/martian` 재사용 |
| 모델 | Gemini: 스캔/중복/검증 = **Flash**, 집필/윤문 = **Pro** | 정확한 모델 ID는 env로 핀 고정 |

### 왜 Cloud Run Job인가

한 번 실행되고 종료되는 배치 성격이라 상주 서비스(Cloud Run Service)나 이벤트 함수(Cloud Function)보다 적합하다. Cloud Scheduler가 Job을 트리거하는 조합이 GCP의 표준 배치 패턴이며, 실행 타임아웃 여유가 크다(Gemini 다단 호출 대비).

## 4. 파이프라인 (Job 1회 실행 = 8단계)

각 단계는 독립 모듈로 분리하고 명확한 입출력을 갖는다.

| # | 단계 | 입력 → 출력 | 구현 |
|---|---|---|---|
| ① | **스캔** | (없음) → 주제 후보 N개 `{제목, 왜지금, 출처URL[]}` | Gemini Flash + Google Search |
| ② | **중복 제거** | 후보 N개 + Notion 기존 제목 전체 → 선택 주제 1개(또는 스킵) | Notion 쿼리 + 정규화 + Gemini 의미 대조 |
| ③ | **리서치** | 선택 주제 → 근거 사실 + 인용 출처 URL[] | Gemini Flash + Google Search 심층 |
| ④ | **집필** | 근거 → 6단 한국어 초안(Markdown) | Gemini Pro + `blog-writer` 양식 프롬프트 |
| ⑤ | **윤문** | 초안 → 슬롭·번역투 제거본(의미 불변) | Gemini Pro + `humanize-korean` 룰북 프롬프트 |
| ⑥ | **자가검증 게이트** | 윤문본 → `{pass: bool, reasons[]}` | Gemini Flash 셀프 체크 |
| ⑦ | **발행** | 윤문본 + 게이트 결과 → Notion 페이지 | `@notionhq/client` + martian (기존 로직 재사용) |
| ⑧ | **알림** | 발행 결과 → 통지 | Webhook(선택) 또는 Cloud Logging |

### 모듈 경계 (`apps/trend-writer/src/`)

- `scan.ts` — 트렌드 후보 수집
- `dedup.ts` — Notion 기존 제목 조회 + 중복 판정 (전부 중복 시 `null` 반환 → 스킵)
- `research.ts` — 선택 주제 심층 조사, 근거+출처 반환
- `write.ts` — 6단 양식 집필 (프롬프트 상수 `prompts/blog-format.ts`)
- `humanize.ts` — 윤문 패스 (프롬프트 상수 `prompts/humanize-rules.ts`)
- `verify.ts` — 자가검증 게이트
- `publish.ts` — Notion 발행 (기존 `publish_to_notion.js` 로직 이식)
- `notify.ts` — 결과 통지
- `gemini.ts` — Gemini 클라이언트 + Google Search 툴 래퍼 (공용)
- `index.ts` — 8단계 오케스트레이션 + 에러 처리

## 5. 데이터 계약

### Notion DB 스키마 (기존, 변경 없음)

`publish_to_notion.js`에서 확인된 프로퍼티를 그대로 사용:

| 프로퍼티 | 타입 | 봇이 넣는 값 |
|---|---|---|
| `이름` | title | 글 제목 |
| `status` | select | `published`(게이트 통과) 또는 `draft`(실패) |
| `category` | multi_select | `AI 트렌드` (전용) |
| `tag` | multi_select | 주제별 태그 (예: React, RSC, RAG) |
| `description` | rich_text | 본문 앞 160자 요약 |

### 글 구조 (기존 `blog-writer` 양식)

```
# 제목
💡 콜아웃 (핵심 요약 1~2문장)
---
## 1. 문제의 배경  ## 2. 해결 방안 탐색  ## 3. 핵심 개념 및 아키텍처
## 4. 구현 및 트러블슈팅  ## 5. 결과 및 Trade-off  ## 6. 마치며
```

**마치며**에 반드시 포함: (a) AI 자동 생성 안내 문구, (b) Google Search 인용 출처 링크 목록.

## 6. 안전장치 (3중)

1. **중복 스킵** — ② 단계에서 후보가 전부 기존 글과 중복이면 억지로 쓰지 않고 이번 회차를 건너뛴다(알림).
2. **자가검증 게이트** — ⑥ 단계에서 4개 기준 점검: 근거 출처 충분 / 기존 글과 비중복 / 6단 양식 준수 / 슬롭 잔여 없음. 하나라도 실패 시 `draft`로 저장하고 알림 → 사람이 검토 후 수동 발행.
3. **1회 1글 상한** — 회당 최대 1글. 대량 발행 불가.

## 7. 품질 담보 (스킬 이식)

Claude Code 스킬은 GCP에서 직접 실행 불가하므로 **규칙셋을 프롬프트로 이식**한다.

- `prompts/blog-format.ts` ← `blog-writer` SKILL.md의 6단 구조 + 톤 규칙(평어체, 전략적 볼드, 친절한 설명, 코드 언어 태그).
- `prompts/humanize-rules.ts` ← `humanize-korean`의 `quick-rules.md`/`ai-tell-taxonomy.md` 핵심 + `ai-slop-reviewer`의 금지어·구조 패턴. 원칙: **의미 불변**, 고유명사·수치·인용 보존, 과윤문 금지.

## 8. 비용 / 운영

- 회당 Gemini 호출 5~7회(주로 Flash, 집필·윤문만 Pro), 예상 비용 회당 소액(센트 단위).
- Cloud Run Job은 실행 시간만 과금 → 주 2–3회 배치라 무시할 수준.
- 실패/스킵은 알림으로 가시화. Cloud Logging에 각 단계 로그 남김.

## 9. 미결 사항 (구현 시 확정)

- **알림 채널**: 기본은 `NOTIFY_WEBHOOK_URL`(Discord/Slack 호환) env 설정 시 push, 미설정 시 Cloud Logging만. → 별도 인프라 없이 시작.
- **정확한 Gemini 모델 ID**: env(`GEMINI_MODEL_WRITE`, `GEMINI_MODEL_UTILITY`)로 핀 고정, 구현 시 최신 안정 버전 확인.
- **cron 스케줄 문자열**: 월·수·금 09:00 KST 기본, 배포 시 확정.
- **신규 category "AI 트렌드"**: 웹의 카테고리 필터가 동적 렌더인지 구현 시 확인(#13에서 카테고리 필터 작업됨) — 신규 값이 자동 노출되는지 검증.

## 10. 성공 기준

- Cloud Scheduler가 주 2–3회 Job을 트리거하고, 근거 출처가 붙은 6단 양식 글이 중복 없이 Notion에 `published`로 올라와 웹에 렌더된다.
- 근거 부족/중복/양식 위반 글은 자동 발행되지 않고 `draft`+알림으로 걸러진다.
- 발행글의 문체가 `humanize-korean` 기준의 AI 슬롭 패턴을 통과한다.
