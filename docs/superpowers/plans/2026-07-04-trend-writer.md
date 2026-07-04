# Trend-Writer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프론트/백/AI 웹개발 최신 동향을 주 2–3회 자동 조사·집필·발행하는 GCP 배치 봇을 만든다.

**Architecture:** 모노레포 신규 앱 `apps/trend-writer`(Node.js/TypeScript). 8단계 파이프라인(스캔→중복제거→리서치→집필→윤문→자가검증→발행→알림)을 순수 함수(프롬프트 빌더·응답 파서·판정 로직)와 얇은 I/O 러너로 분리해 TDD한다. Gemini(Google Search 그라운딩)로 조사·집필, `@notionhq/client`+martian으로 발행. Cloud Run Job을 Cloud Scheduler cron이 트리거한다.

**Tech Stack:** TypeScript, `@google/genai`, `@notionhq/client`, `@tryfabric/martian`, vitest, Docker, GCP(Cloud Run Job / Cloud Scheduler / Secret Manager / Artifact Registry). 프로비저닝은 GCP MCP(`mcp__gcloud__run_gcloud_command`).

## Global Constraints

- Node.js 20+ (`engines.node >= 20.9`, 루트와 일치). 전역 `fetch` 사용(Node 20 내장).
- 패키지 매니저 pnpm 9, 워크스페이스 `apps/*`. 새 앱 이름은 `trend-writer`.
- TypeScript: 공유 `@hooneylog/typescript-config/base.json` 확장. 이 앱은 `module: CommonJS`로 오버라이드(실행 마찰 최소화).
- 테스트: vitest, `src/**/*.test.ts` 콜로케이션.
- Notion DB 프로퍼티(변경 금지, `publish_to_notion.js` 기준): `이름`(title), `status`(select), `category`(multi_select), `tag`(multi_select), `description`(rich_text).
- 발행 전용 카테고리: 기본값 `AI 트렌드`(env `AI_CATEGORY`로 오버라이드 가능).
- 회당 1글 상한. 중복 전량 시 스킵. 자가검증 실패 시 `draft`+알림.
- 모든 사실은 리서치 단계의 Google Search 근거에 기반. 글 하단에 출처 URL + AI 자동생성 안내 노출.
- 의미 불변 원칙(윤문): 고유명사·수치·날짜·직접인용 100% 보존.

## 파일 구조 (`apps/trend-writer/`)

| 파일 | 책임 |
|---|---|
| `package.json`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.dockerignore`, `Dockerfile` | 스캐폴드/빌드/배포 설정 |
| `src/types.ts` | 공용 타입·포트 인터페이스 |
| `src/config.ts` | env 로드 |
| `src/gemini.ts` | Gemini 클라이언트 래퍼 + 그라운딩 출처 추출 + JSON 파서 |
| `src/prompts/blog-format.ts` | 6단 양식·톤 프롬프트 |
| `src/prompts/humanize-rules.ts` | humanize-korean/ai-slop 룰북 이식 프롬프트 |
| `src/scan.ts` | 트렌드 후보 수집 |
| `src/dedup.ts` | 제목 정규화·중복 판정·주제 선택 |
| `src/research.ts` | 선택 주제 심층 조사 |
| `src/write.ts` | 6단 집필 + 하단 출처/안내 |
| `src/humanize.ts` | 윤문 패스 |
| `src/verify.ts` | 자가검증 게이트 |
| `src/publish.ts` | Notion 발행 포트 |
| `src/notify.ts` | 결과 통지 |
| `src/index.ts` | 파이프라인 오케스트레이션 + `main()` |

---

### Task 1: 패키지 스캐폴드 + 공용 타입

**Files:**
- Create: `apps/trend-writer/package.json`
- Create: `apps/trend-writer/tsconfig.json`
- Create: `apps/trend-writer/vitest.config.ts`
- Create: `apps/trend-writer/.env.example`
- Create: `apps/trend-writer/src/types.ts`
- Test: `apps/trend-writer/src/types.test.ts`

**Interfaces:**
- Produces: 타입 `TopicCandidate`, `ResearchResult`, `DraftPost`, `VerifyResult`, `PublishInput`, `PublishResult`, `PipelineResult`, `Config`; 포트 인터페이스 `Gemini`, `GroundedResponse`, `NotionPort`, `Notifier`.

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "trend-writer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@google/genai": "^1.9.0",
    "@notionhq/client": "^2.3.0",
    "@tryfabric/martian": "^1.2.4"
  },
  "devDependencies": {
    "@hooneylog/typescript-config": "workspace:*",
    "@types/node": "^20",
    "tsx": "^4.19.2",
    "typescript": "^5",
    "vitest": "^4.1.2"
  }
}
```

- [ ] **Step 2: tsconfig.json 작성**

```json
{
  "extends": "@hooneylog/typescript-config/base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "dist",
    "rootDir": "src",
    "declaration": false,
    "declarationMap": false,
    "noEmit": false
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

- [ ] **Step 3: vitest.config.ts 작성**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: .env.example 작성**

```bash
# Gemini
GEMINI_API_KEY=
GEMINI_MODEL_WRITE=gemini-2.5-pro
GEMINI_MODEL_UTILITY=gemini-2.5-flash

# Notion
NOTION_API_KEY=
NOTION_DATABASE_ID=

# 발행 전용 카테고리
AI_CATEGORY=AI 트렌드

# 선택: Discord/Slack 호환 webhook. 미설정 시 stdout 로깅만.
NOTIFY_WEBHOOK_URL=
```

- [ ] **Step 5: src/types.ts 작성**

```ts
export type TrendArea = 'frontend' | 'backend' | 'ai-web';

export interface TopicCandidate {
  title: string;
  whyNow: string;
  sources: string[];
  area: TrendArea;
}

export interface ResearchResult {
  facts: string[];
  sources: string[];
}

export interface DraftPost {
  title: string;
  markdown: string;
  tags: string[];
}

export interface VerifyResult {
  pass: boolean;
  reasons: string[];
}

export interface PublishInput {
  title: string;
  markdown: string;
  tags: string[];
  status: 'published' | 'draft';
}

export interface PublishResult {
  url: string;
  pageId: string;
}

export interface PipelineResult {
  outcome: 'published' | 'draft' | 'skipped';
  title?: string;
  url?: string;
  reasons?: string[];
}

export interface Config {
  geminiApiKey: string;
  notionApiKey: string;
  notionDatabaseId: string;
  aiCategory: string;
  notifyWebhookUrl: string;
  modelWrite: string;
  modelUtility: string;
}

export interface GroundedResponse {
  text: string;
  sources: string[];
}

export interface Gemini {
  generateGrounded(prompt: string, model: string): Promise<GroundedResponse>;
  generateText(prompt: string, model: string): Promise<string>;
}

export interface NotionPort {
  fetchExistingTitles(): Promise<string[]>;
  createPost(input: PublishInput): Promise<PublishResult>;
}

export type Notifier = (message: string) => Promise<void>;
```

- [ ] **Step 6: 타입 스모크 테스트 작성 (src/types.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import type { TopicCandidate, PipelineResult } from './types';

describe('types', () => {
  it('구조가 컴파일되고 값을 담는다', () => {
    const c: TopicCandidate = { title: 'T', whyNow: 'w', sources: ['https://a'], area: 'frontend' };
    const r: PipelineResult = { outcome: 'skipped' };
    expect(c.area).toBe('frontend');
    expect(r.outcome).toBe('skipped');
  });
});
```

- [ ] **Step 7: 설치 후 테스트 실행 (실패→통과 확인)**

Run: `pnpm install && pnpm --filter trend-writer test`
Expected: `types.test.ts` 1 passed. (설치가 새 deps를 받아야 함)

- [ ] **Step 8: 커밋**

```bash
git add apps/trend-writer pnpm-lock.yaml
git commit -m "feat(trend-writer): 패키지 스캐폴드 + 공용 타입"
```

---

### Task 2: Gemini 클라이언트 래퍼

**Files:**
- Create: `apps/trend-writer/src/gemini.ts`
- Test: `apps/trend-writer/src/gemini.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `GroundedResponse` (Task 1).
- Produces: `createGemini(apiKey: string): Gemini`; `extractGroundingSources(response: unknown): string[]`; `parseJsonBlock<T>(text: string): T`.

- [ ] **Step 1: 실패 테스트 작성 (src/gemini.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { extractGroundingSources, parseJsonBlock } from './gemini';

describe('extractGroundingSources', () => {
  it('groundingChunks의 web.uri를 중복 제거해 뽑는다', () => {
    const resp = {
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://a.com', title: 'A' } },
              { web: { uri: 'https://b.com', title: 'B' } },
              { web: { uri: 'https://a.com', title: 'A dup' } },
            ],
          },
        },
      ],
    };
    expect(extractGroundingSources(resp)).toEqual(['https://a.com', 'https://b.com']);
  });

  it('메타데이터가 없으면 빈 배열', () => {
    expect(extractGroundingSources({ candidates: [{}] })).toEqual([]);
  });
});

describe('parseJsonBlock', () => {
  it('코드펜스로 감싼 JSON 배열을 파싱한다', () => {
    const text = 'here:\n```json\n[{"title":"x"}]\n```\ndone';
    expect(parseJsonBlock<Array<{ title: string }>>(text)).toEqual([{ title: 'x' }]);
  });

  it('펜스 없는 객체도 파싱한다', () => {
    expect(parseJsonBlock<{ pass: boolean }>('{"pass": true}')).toEqual({ pass: true });
  });

  it('JSON이 없으면 throw', () => {
    expect(() => parseJsonBlock('no json here')).toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/gemini.test.ts`
Expected: FAIL ("Cannot find module './gemini'").

- [ ] **Step 3: 구현 (src/gemini.ts)**

```ts
import { GoogleGenAI } from '@google/genai';
import type { Gemini, GroundedResponse } from './types';

export function extractGroundingSources(response: unknown): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const candidates = (response as { candidates?: unknown[] })?.candidates ?? [];
  for (const cand of candidates) {
    const chunks =
      (cand as { groundingMetadata?: { groundingChunks?: unknown[] } })?.groundingMetadata
        ?.groundingChunks ?? [];
    for (const chunk of chunks) {
      const uri = (chunk as { web?: { uri?: string } })?.web?.uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        out.push(uri);
      }
    }
  }
  return out;
}

export function parseJsonBlock<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : text).trim();
  const first = raw.search(/[[{]/);
  if (first === -1) throw new Error('No JSON found in response');
  const open = raw[first];
  const close = open === '{' ? '}' : ']';
  const last = raw.lastIndexOf(close);
  if (last <= first) throw new Error('Malformed JSON in response');
  return JSON.parse(raw.slice(first, last + 1)) as T;
}

export function createGemini(apiKey: string): Gemini {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async generateGrounded(prompt: string, model: string): Promise<GroundedResponse> {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      return { text: response.text ?? '', sources: extractGroundingSources(response) };
    },
    async generateText(prompt: string, model: string): Promise<string> {
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text ?? '';
    },
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/gemini.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/gemini.ts apps/trend-writer/src/gemini.test.ts
git commit -m "feat(trend-writer): Gemini 래퍼 + 그라운딩 출처/JSON 파서"
```

---

### Task 3: 6단 양식 프롬프트

**Files:**
- Create: `apps/trend-writer/src/prompts/blog-format.ts`
- Test: `apps/trend-writer/src/prompts/blog-format.test.ts`

**Interfaces:**
- Consumes: `TopicCandidate`, `ResearchResult` (Task 1).
- Produces: `BLOG_FORMAT_RULES: string`; `buildWritePrompt(topic: TopicCandidate, research: ResearchResult): string`.

- [ ] **Step 1: 실패 테스트 작성 (src/prompts/blog-format.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { BLOG_FORMAT_RULES, buildWritePrompt } from './blog-format';

const topic = { title: 'React 19 Actions 완전정복', whyNow: '19 GA', sources: ['https://react.dev'], area: 'frontend' as const };
const research = { facts: ['useActionState는 폼 상태를 관리한다'], sources: ['https://react.dev/actions'] };

describe('buildWritePrompt', () => {
  it('6단 헤딩과 콜아웃 규칙을 포함한다', () => {
    expect(BLOG_FORMAT_RULES).toContain('## 1. 문제의 배경');
    expect(BLOG_FORMAT_RULES).toContain('## 6. 마치며');
    expect(BLOG_FORMAT_RULES).toContain('notion-callout');
  });

  it('주제와 근거 사실을 프롬프트에 주입한다', () => {
    const p = buildWritePrompt(topic, research);
    expect(p).toContain('React 19 Actions 완전정복');
    expect(p).toContain('useActionState는 폼 상태를 관리한다');
    expect(p).toContain('평어체');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/prompts/blog-format.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/prompts/blog-format.ts)**

```ts
import type { ResearchResult, TopicCandidate } from '../types';

export const BLOG_FORMAT_RULES = `너는 HooneyLog의 시니어 풀스택 개발자 필자다. React/Next.js와 NestJS에 능하며, 동료에게 지식을 전파하듯 글을 쓴다.

## 톤
- 평어체(~다/~입니다/~해요 혼용). 딱딱한 학술체 금지.
- 어려운 용어는 쉬운 비유로 풀어 설명. 복잡한 개념은 단계별로.
- 핵심 기술 키워드/문장에만 전략적으로 볼드(**). 모든 문장 볼드 금지.
- 코드 외 모든 텍스트는 한국어. 제목/목차에 영문 병기 금지.

## 구조(엄격히 준수)
# [명확하고 시선을 끄는 제목]

<div class="notion-callout"><div class="notion-callout-icon">💡</div><div class="notion-callout-content">핵심 내용·해결한 문제·이점을 1~2문장으로 요약</div></div>

---

## 1. 문제의 배경
## 2. 해결 방안 탐색
## 3. 핵심 개념 및 아키텍처
## 4. 구현 및 트러블슈팅
## 5. 결과 및 Trade-off
## 6. 마치며

## 코드
- 코드블록에 언어 태그 명시(\`\`\`typescript, \`\`\`tsx 등).
- 최신·비폐기 API만 사용. 확실치 않으면 근거에 없는 API를 지어내지 않는다.`;

export function buildWritePrompt(topic: TopicCandidate, research: ResearchResult): string {
  const facts = research.facts.map((f, i) => `${i + 1}. ${f}`).join('\n');
  return `${BLOG_FORMAT_RULES}

## 이번 글 주제
제목 방향: ${topic.title}
분야: ${topic.area}
지금 다루는 이유: ${topic.whyNow}

## 검증된 근거 사실(아래 사실에만 근거해 작성. 없는 내용 지어내기 금지)
${facts}

위 구조와 톤을 지켜 완성된 한국어 마크다운 글 하나만 출력해라. 설명·머리말 없이 '# 제목'부터 시작한다.`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/prompts/blog-format.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/prompts/blog-format.ts apps/trend-writer/src/prompts/blog-format.test.ts
git commit -m "feat(trend-writer): 6단 양식 집필 프롬프트"
```

---

### Task 4: 윤문 룰북 프롬프트 (humanize-korean 이식)

**Files:**
- Create: `apps/trend-writer/src/prompts/humanize-rules.ts`
- Test: `apps/trend-writer/src/prompts/humanize-rules.test.ts`

**Interfaces:**
- Produces: `HUMANIZE_RULES: string`; `buildHumanizePrompt(markdown: string): string`.

- [ ] **Step 1: 실패 테스트 작성 (src/prompts/humanize-rules.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { HUMANIZE_RULES, buildHumanizePrompt } from './humanize-rules';

describe('humanize rules', () => {
  it('핵심 S1 패턴과 의미불변 원칙을 담는다', () => {
    expect(HUMANIZE_RULES).toContain('이중 피동');
    expect(HUMANIZE_RULES).toContain('결론적으로');
    expect(HUMANIZE_RULES).toContain('의미 불변');
  });

  it('대상 마크다운을 프롬프트에 주입하고 코드 보존을 지시한다', () => {
    const p = buildHumanizePrompt('# 제목\n\n본문');
    expect(p).toContain('# 제목');
    expect(p).toContain('코드블록');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/prompts/humanize-rules.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/prompts/humanize-rules.ts)**

```ts
export const HUMANIZE_RULES = `한국어 텍스트에서 AI가 쓴 흔적을 수술적으로 제거해 사람이 쓴 글처럼 다듬는다.

## 4대 철칙
1. 의미 불변 — 사실·주장·수치·고유명사·직접 인용은 100% 원문 보존.
2. 근거 기반 — 아래 패턴이 실제로 있는 구간만 수정. 없는 구간은 건드리지 않는다.
3. 장르 유지 — 기술 블로그체를 에세이·문학으로 바꾸지 않는다.
4. 과윤문 금지 — 전체 변경률 30%를 넘기지 않는다.

## Do-NOT(수정 제외)
고유명사·제품명·모델명, 수치·날짜·단위, 큰따옴표 직접 인용, 코드블록·인라인 코드, 수식, 업계 표준 약어(LLM·GPU·API·RSC 등).

## S1(무조건 제거)
- 이중 피동 "~되어진다" → 단일 피동/능동("판단되어진다"→"판단된다").
- have/make/take 직역 "~을 가지다" → 형용사·동사 환원("경쟁력을 가지다"→"경쟁력이 강하다").
- 결산 피벗어 "결론적으로/따라서/이를 통해/요약하면" 남발 → 1~2회만, 나머지 삭제.
- "시사하는 바가 크다/주목할 만하다", "본질적으로/핵심적으로" → 삭제 또는 구체화.
- hype어(파격적·압도적·획기적·강력한) → 구체 수치·사실로.
- 문두 접속사(또한·따라서·즉·나아가·게다가) 5회+ → 대량 제거.
- 연결어미 뒤 쉼표(-고,/-며,/-지만,/-어서,) → 쉼표 제거.
- 콜론 부제 헤딩 "X: Y" 반복 → 짧은 평서 헤딩.
- "~인 것이다/~한 것이다" 결말 → 평서형.
- 이모지 남발, 따옴표 강조 5회+ → 핵심만 남기고 평어로.

## S2(줄이기)
- 번역투 "~에 대해/~를 통해/~에 있어서/~와 관련하여" → 조사·연결로 직결.
- "~에 의해" 피동 → 행위자 주어("AI에 의해 생성"→"AI가 만든").
- "~할 수 있다/~것이다/~로 보인다" 남발 → 단언 가능하면 단언.
- 기계적 병렬 "첫째·둘째·셋째", "먼저·반면·결국" 3단 공식 → 본문에 녹이기.
- 한자어 명사화 -성/-적/-화 누적 → 동사·형용사 어근으로.
- 문장 길이 균일 → 각 문단에 단문 1~2개와 장문 1개를 섞어 리듬 부여.
- 동일 종결어미 "~다" 4문장 연속 → 종결 다양화.

## 자가검증(수정 후)
고유명사·수치·인용 보존 / 변경률 30% 이하 / 장르 유지 / 원문에 없던 비유·수사 임의 추가 금지 / S1 잔존 0.`;

export function buildHumanizePrompt(markdown: string): string {
  return `${HUMANIZE_RULES}

## 대상 글(아래 마크다운을 위 규칙으로 윤문)
코드블록·인라인 코드·수식·링크 URL은 절대 변형하지 않는다. 마크다운 구조(헤딩·콜아웃·리스트)는 유지한다.

---
${markdown}
---

윤문된 마크다운 전문만 출력해라. 설명·주석 없이 '# 제목'부터 시작한다.`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/prompts/humanize-rules.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/prompts/humanize-rules.ts apps/trend-writer/src/prompts/humanize-rules.test.ts
git commit -m "feat(trend-writer): humanize-korean 룰북 이식 프롬프트"
```

---

### Task 5: 스캔 모듈

**Files:**
- Create: `apps/trend-writer/src/scan.ts`
- Test: `apps/trend-writer/src/scan.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `TopicCandidate` (Task 1); `parseJsonBlock` (Task 2).
- Produces: `SCAN_PROMPT: string`; `parseScanResult(text: string): TopicCandidate[]`; `runScan(gemini: Gemini, model: string): Promise<TopicCandidate[]>`.

- [ ] **Step 1: 실패 테스트 작성 (src/scan.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { parseScanResult, runScan } from './scan';
import type { Gemini } from './types';

describe('parseScanResult', () => {
  it('JSON 배열을 TopicCandidate[]로 파싱하고 잘못된 항목을 거른다', () => {
    const text = '```json\n[{"title":"A","whyNow":"w","sources":["https://a"],"area":"frontend"},{"title":""}]\n```';
    const out = parseScanResult(text);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('A');
    expect(out[0].area).toBe('frontend');
  });

  it('area가 이상하면 ai-web으로 보정', () => {
    const out = parseScanResult('[{"title":"A","whyNow":"w","sources":[],"area":"weird"}]');
    expect(out[0].area).toBe('ai-web');
  });
});

describe('runScan', () => {
  it('gemini.generateGrounded 결과를 파싱해 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({
        text: '[{"title":"A","whyNow":"w","sources":["https://a"],"area":"backend"}]',
        sources: ['https://a'],
      }),
      generateText: async () => '',
    };
    const out = await runScan(gemini, 'm');
    expect(out[0].area).toBe('backend');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/scan.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/scan.ts)**

```ts
import type { Gemini, TopicCandidate, TrendArea } from './types';
import { parseJsonBlock } from './gemini';

export const SCAN_PROMPT = `너는 기술 블로그 편집자다. Google Search로 최근 2~4주 안의 프론트엔드·백엔드·AI 드리븐 웹개발 동향을 조사해라.
실무 개발자가 지금 배우면 유익한, 구체적이고 검증 가능한 주제 후보 6개를 뽑아라.
막연한 홍보성·마케팅 주제는 제외하고, 릴리스·스펙 변화·패턴·트러블슈팅처럼 손에 잡히는 주제를 우선한다.

각 후보를 아래 JSON 배열로만 출력해라(설명 금지):
[{"title":"한국어 제목 방향","whyNow":"지금 다룰 이유 한 문장","sources":["출처 URL"],"area":"frontend|backend|ai-web"}]`;

const AREAS: TrendArea[] = ['frontend', 'backend', 'ai-web'];

interface RawCandidate {
  title?: unknown;
  whyNow?: unknown;
  sources?: unknown;
  area?: unknown;
}

export function parseScanResult(text: string): TopicCandidate[] {
  const raw = parseJsonBlock<RawCandidate[]>(text);
  if (!Array.isArray(raw)) return [];
  const out: TopicCandidate[] = [];
  for (const item of raw) {
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;
    const area = AREAS.includes(item.area as TrendArea) ? (item.area as TrendArea) : 'ai-web';
    const sources = Array.isArray(item.sources)
      ? item.sources.filter((s): s is string => typeof s === 'string')
      : [];
    out.push({
      title,
      whyNow: typeof item.whyNow === 'string' ? item.whyNow : '',
      sources,
      area,
    });
  }
  return out;
}

export async function runScan(gemini: Gemini, model: string): Promise<TopicCandidate[]> {
  const res = await gemini.generateGrounded(SCAN_PROMPT, model);
  return parseScanResult(res.text);
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/scan.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/scan.ts apps/trend-writer/src/scan.test.ts
git commit -m "feat(trend-writer): 트렌드 스캔 모듈"
```

---

### Task 6: 중복 제거 모듈 (핵심 로직)

**Files:**
- Create: `apps/trend-writer/src/dedup.ts`
- Test: `apps/trend-writer/src/dedup.test.ts`

**Interfaces:**
- Consumes: `TopicCandidate` (Task 1).
- Produces: `normalizeTitle(title: string): string`; `isDuplicate(candidate: string, existing: string[]): boolean`; `pickFreshTopic(candidates: TopicCandidate[], existingTitles: string[]): TopicCandidate | null`.

- [ ] **Step 1: 실패 테스트 작성 (src/dedup.test.ts)**

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/dedup.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/dedup.ts)**

```ts
import type { TopicCandidate } from './types';

export function normalizeTitle(title: string): string {
  return title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function isDuplicate(candidate: string, existing: string[]): boolean {
  const n = normalizeTitle(candidate);
  if (!n) return false;
  const contains = (a: string, b: string): boolean => b.length >= 6 && a.includes(b);
  return existing.some((e) => {
    const en = normalizeTitle(e);
    return en === n || contains(en, n) || contains(n, en);
  });
}

export function pickFreshTopic(
  candidates: TopicCandidate[],
  existingTitles: string[],
): TopicCandidate | null {
  return candidates.find((c) => !isDuplicate(c.title, existingTitles)) ?? null;
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/dedup.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/dedup.ts apps/trend-writer/src/dedup.test.ts
git commit -m "feat(trend-writer): 제목 정규화·중복 판정·주제 선택"
```

---

### Task 7: 리서치 모듈

**Files:**
- Create: `apps/trend-writer/src/research.ts`
- Test: `apps/trend-writer/src/research.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `TopicCandidate`, `ResearchResult` (Task 1); `parseJsonBlock` (Task 2).
- Produces: `buildResearchPrompt(topic: TopicCandidate): string`; `parseResearchFacts(text: string): string[]`; `runResearch(gemini: Gemini, model: string, topic: TopicCandidate): Promise<ResearchResult>`.

- [ ] **Step 1: 실패 테스트 작성 (src/research.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { buildResearchPrompt, parseResearchFacts, runResearch } from './research';
import type { Gemini } from './types';

const topic = { title: 'RSC 스트리밍', whyNow: 'w', sources: ['https://a'], area: 'frontend' as const };

describe('buildResearchPrompt', () => {
  it('주제 제목을 담고 근거 기반 조사를 지시한다', () => {
    const p = buildResearchPrompt(topic);
    expect(p).toContain('RSC 스트리밍');
    expect(p).toContain('출처');
  });
});

describe('parseResearchFacts', () => {
  it('facts 배열을 파싱한다', () => {
    expect(parseResearchFacts('{"facts":["a","b"]}')).toEqual(['a', 'b']);
  });
  it('facts가 없으면 빈 배열', () => {
    expect(parseResearchFacts('{"x":1}')).toEqual([]);
  });
});

describe('runResearch', () => {
  it('facts와 그라운딩 sources를 합쳐 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '{"facts":["f1"],"sources":["https://x"]}', sources: ['https://g'] }),
      generateText: async () => '',
    };
    const out = await runResearch(gemini, 'm', topic);
    expect(out.facts).toEqual(['f1']);
    expect(out.sources).toContain('https://g');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/research.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/research.ts)**

```ts
import type { Gemini, ResearchResult, TopicCandidate } from './types';
import { parseJsonBlock } from './gemini';

export function buildResearchPrompt(topic: TopicCandidate): string {
  return `Google Search로 아래 주제를 심층 조사해라. 추측 금지, 검색으로 확인된 사실만 수집한다.

주제: ${topic.title}
분야: ${topic.area}
배경: ${topic.whyNow}

버전·API·동작 원리·실무 트레이드오프·흔한 함정을 포함해 8~14개의 구체적 사실을 뽑아라.
각 사실은 검색 출처로 뒷받침돼야 한다. 아래 JSON만 출력(설명 금지):
{"facts":["구체적 사실 문장", "..."],"sources":["근거 URL", "..."]}`;
}

interface RawResearch {
  facts?: unknown;
}

export function parseResearchFacts(text: string): string[] {
  const raw = parseJsonBlock<RawResearch>(text);
  if (!Array.isArray(raw.facts)) return [];
  return raw.facts.filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
}

export async function runResearch(
  gemini: Gemini,
  model: string,
  topic: TopicCandidate,
): Promise<ResearchResult> {
  const res = await gemini.generateGrounded(buildResearchPrompt(topic), model);
  const facts = parseResearchFacts(res.text);
  const merged = new Set<string>([...res.sources, ...topic.sources]);
  return { facts, sources: [...merged] };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/research.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/research.ts apps/trend-writer/src/research.test.ts
git commit -m "feat(trend-writer): 심층 리서치 모듈"
```

---

### Task 8: 집필 모듈 + 하단 출처/안내

**Files:**
- Create: `apps/trend-writer/src/write.ts`
- Test: `apps/trend-writer/src/write.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `TopicCandidate`, `ResearchResult`, `DraftPost` (Task 1); `buildWritePrompt` (Task 3).
- Produces: `extractTitle(markdown: string): string`; `assembleFooter(sources: string[]): string`; `appendFooter(markdown: string, sources: string[]): string`; `deriveTags(topic: TopicCandidate): string[]`; `runWrite(gemini, model, topic, research): Promise<DraftPost>`.

- [ ] **Step 1: 실패 테스트 작성 (src/write.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { extractTitle, assembleFooter, appendFooter, deriveTags, runWrite } from './write';
import type { Gemini } from './types';

const topic = { title: 'React 19 Actions', whyNow: 'w', sources: [], area: 'frontend' as const };
const research = { facts: ['f'], sources: ['https://a'] };

describe('extractTitle', () => {
  it('첫 H1을 제목으로 뽑는다', () => {
    expect(extractTitle('# 진짜 제목\n\n본문')).toBe('진짜 제목');
  });
  it('H1이 없으면 주제 폴백은 호출부 책임 — 빈 문자열', () => {
    expect(extractTitle('본문만 있음')).toBe('');
  });
});

describe('assembleFooter', () => {
  it('AI 자동생성 안내와 출처 링크를 담는다', () => {
    const f = assembleFooter(['https://a', 'https://b']);
    expect(f).toContain('자동으로');
    expect(f).toContain('https://a');
    expect(f).toContain('https://b');
  });
});

describe('deriveTags', () => {
  it('분야를 한글 태그로 매핑', () => {
    expect(deriveTags(topic)).toContain('프론트엔드');
  });
});

describe('runWrite', () => {
  it('본문에 푸터를 붙이고 제목/태그를 세팅', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '# React 19 Actions\n\n본문입니다.',
    };
    const draft = await runWrite(gemini, 'm', topic, research);
    expect(draft.title).toBe('React 19 Actions');
    expect(draft.markdown).toContain('참고 출처');
    expect(draft.tags).toContain('프론트엔드');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/write.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/write.ts)**

```ts
import type { DraftPost, Gemini, ResearchResult, TopicCandidate, TrendArea } from './types';
import { buildWritePrompt } from './prompts/blog-format';

const AREA_TAG: Record<TrendArea, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  'ai-web': 'AI',
};

export function extractTitle(markdown: string): string {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

export function assembleFooter(sources: string[]): string {
  const list = sources.length ? sources.map((u) => `- ${u}`).join('\n') : '- (출처 없음)';
  return [
    '',
    '---',
    '',
    '> 이 글은 최신 기술 동향을 자동으로 조사·정리해 발행한 지식 전파용 글입니다. 아래 출처를 함께 보면 이해에 도움이 됩니다.',
    '',
    '**참고 출처**',
    '',
    list,
    '',
  ].join('\n');
}

export function appendFooter(markdown: string, sources: string[]): string {
  return `${markdown.trimEnd()}\n${assembleFooter(sources)}`;
}

export function deriveTags(topic: TopicCandidate): string[] {
  return [AREA_TAG[topic.area]];
}

export async function runWrite(
  gemini: Gemini,
  model: string,
  topic: TopicCandidate,
  research: ResearchResult,
): Promise<DraftPost> {
  const body = await gemini.generateText(buildWritePrompt(topic, research), model);
  const title = extractTitle(body) || topic.title;
  const markdown = appendFooter(body, research.sources);
  return { title, markdown, tags: deriveTags(topic) };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/write.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/write.ts apps/trend-writer/src/write.test.ts
git commit -m "feat(trend-writer): 집필 모듈 + 출처/AI안내 푸터"
```

---

### Task 9: 윤문 모듈

**Files:**
- Create: `apps/trend-writer/src/humanize.ts`
- Test: `apps/trend-writer/src/humanize.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `DraftPost` (Task 1); `buildHumanizePrompt` (Task 4); `extractTitle` (Task 8).
- Produces: `runHumanize(gemini: Gemini, model: string, draft: DraftPost): Promise<DraftPost>`.

- [ ] **Step 1: 실패 테스트 작성 (src/humanize.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { runHumanize } from './humanize';
import type { DraftPost, Gemini } from './types';

const draft: DraftPost = { title: '원제목', markdown: '# 원제목\n\n본문', tags: ['프론트엔드'] };

describe('runHumanize', () => {
  it('윤문 결과 마크다운으로 교체하고 태그는 보존', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '# 다듬은 제목\n\n다듬은 본문',
    };
    const out = await runHumanize(gemini, 'm', draft);
    expect(out.markdown).toContain('다듬은 본문');
    expect(out.title).toBe('다듬은 제목');
    expect(out.tags).toEqual(['프론트엔드']);
  });

  it('윤문 결과가 비면 원본 유지(안전 폴백)', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '   ',
    };
    const out = await runHumanize(gemini, 'm', draft);
    expect(out.markdown).toBe(draft.markdown);
    expect(out.title).toBe('원제목');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/humanize.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/humanize.ts)**

```ts
import type { DraftPost, Gemini } from './types';
import { buildHumanizePrompt } from './prompts/humanize-rules';
import { extractTitle } from './write';

export async function runHumanize(
  gemini: Gemini,
  model: string,
  draft: DraftPost,
): Promise<DraftPost> {
  const result = await gemini.generateText(buildHumanizePrompt(draft.markdown), model);
  const trimmed = result.trim();
  if (!trimmed) return draft;
  return {
    title: extractTitle(trimmed) || draft.title,
    markdown: trimmed,
    tags: draft.tags,
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/humanize.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/humanize.ts apps/trend-writer/src/humanize.test.ts
git commit -m "feat(trend-writer): 윤문 패스 모듈"
```

---

### Task 10: 자가검증 게이트

**Files:**
- Create: `apps/trend-writer/src/verify.ts`
- Test: `apps/trend-writer/src/verify.test.ts`

**Interfaces:**
- Consumes: `Gemini`, `DraftPost`, `VerifyResult` (Task 1); `parseJsonBlock` (Task 2).
- Produces: `buildVerifyPrompt(draft: DraftPost, existingTitles: string[]): string`; `parseVerdict(text: string): VerifyResult`; `runVerify(gemini, model, draft, existingTitles): Promise<VerifyResult>`.

- [ ] **Step 1: 실패 테스트 작성 (src/verify.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { buildVerifyPrompt, parseVerdict, runVerify } from './verify';
import type { DraftPost, Gemini } from './types';

const draft: DraftPost = { title: 'T', markdown: '# T\n\n본문\n\n참고 출처\n- https://a', tags: ['AI'] };

describe('buildVerifyPrompt', () => {
  it('4개 검증 기준과 기존 제목을 담는다', () => {
    const p = buildVerifyPrompt(draft, ['기존글1']);
    expect(p).toContain('기존글1');
    expect(p).toContain('출처');
    expect(p).toContain('양식');
  });
});

describe('parseVerdict', () => {
  it('pass/reasons를 파싱', () => {
    expect(parseVerdict('{"pass":true,"reasons":[]}')).toEqual({ pass: true, reasons: [] });
  });
  it('pass가 불리언이 아니면 실패로 간주', () => {
    expect(parseVerdict('{"reasons":["x"]}').pass).toBe(false);
  });
  it('파싱 불가 시 실패 + 사유', () => {
    const v = parseVerdict('완전 깨진 응답');
    expect(v.pass).toBe(false);
    expect(v.reasons.length).toBeGreaterThan(0);
  });
});

describe('runVerify', () => {
  it('gemini 응답을 판정으로 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({ text: '', sources: [] }),
      generateText: async () => '{"pass":false,"reasons":["근거 부족"]}',
    };
    const v = await runVerify(gemini, 'm', draft, []);
    expect(v.pass).toBe(false);
    expect(v.reasons).toContain('근거 부족');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/verify.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/verify.ts)**

```ts
import type { DraftPost, Gemini, VerifyResult } from './types';
import { parseJsonBlock } from './gemini';

export function buildVerifyPrompt(draft: DraftPost, existingTitles: string[]): string {
  const titles = existingTitles.map((t) => `- ${t}`).join('\n') || '- (없음)';
  return `아래 기술 블로그 글이 자동 발행 기준을 통과하는지 냉정하게 평가해라.

기준(하나라도 미달이면 pass=false):
1. 근거 충분 — 하단 '참고 출처'에 실제 URL이 있고, 본문 주장이 근거에 기반하는가.
2. 중복 아님 — 아래 기존 글 목록과 주제가 실질적으로 겹치지 않는가.
3. 양식 준수 — # 제목, 💡 콜아웃, '## 1.'~'## 6.' 6단 헤딩이 있는가.
4. 슬롭 없음 — 이중 피동·기계적 병렬·"결론적으로/시사하는 바가 크다" 등 AI 티가 과하지 않은가.

기존 글 제목:
${titles}

평가 대상:
---
${draft.markdown}
---

아래 JSON만 출력(설명 금지):
{"pass": true|false, "reasons": ["미달 사유(있으면)"]}`;
}

interface RawVerdict {
  pass?: unknown;
  reasons?: unknown;
}

export function parseVerdict(text: string): VerifyResult {
  try {
    const raw = parseJsonBlock<RawVerdict>(text);
    const pass = raw.pass === true;
    const reasons = Array.isArray(raw.reasons)
      ? raw.reasons.filter((r): r is string => typeof r === 'string')
      : [];
    return { pass, reasons };
  } catch {
    return { pass: false, reasons: ['자가검증 응답 파싱 실패'] };
  }
}

export async function runVerify(
  gemini: Gemini,
  model: string,
  draft: DraftPost,
  existingTitles: string[],
): Promise<VerifyResult> {
  const text = await gemini.generateText(buildVerifyPrompt(draft, existingTitles), model);
  return parseVerdict(text);
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/verify.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/verify.ts apps/trend-writer/src/verify.test.ts
git commit -m "feat(trend-writer): 자가검증 게이트"
```

---

### Task 11: Notion 발행 포트

**Files:**
- Create: `apps/trend-writer/src/publish.ts`
- Test: `apps/trend-writer/src/publish.test.ts`

**Interfaces:**
- Consumes: `PublishInput`, `PublishResult`, `NotionPort` (Task 1).
- Produces: `buildDescription(markdown: string): string`; `buildNotionProperties(input: PublishInput, aiCategory: string): Record<string, unknown>`; `createNotionPort(client, databaseId, aiCategory): NotionPort`. (`client`는 `@notionhq/client`의 `Client` 최소 인터페이스 `{ pages: { create }, databases: { query } }`.)

- [ ] **Step 1: 실패 테스트 작성 (src/publish.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { buildDescription, buildNotionProperties, createNotionPort } from './publish';
import type { PublishInput } from './types';

const input: PublishInput = { title: '제목', markdown: '# 제목\n\n**본문** 내용', tags: ['AI', 'RSC'], status: 'published' };

describe('buildDescription', () => {
  it('마크다운 마커를 제거하고 160자로 자른다', () => {
    const d = buildDescription('# 제목\n\n' + 'a'.repeat(300));
    expect(d.length).toBeLessThanOrEqual(163);
    expect(d).not.toContain('#');
    expect(d.endsWith('...')).toBe(true);
  });
});

describe('buildNotionProperties', () => {
  it('status/category/tag/description를 스키마대로 만든다', () => {
    const p = buildNotionProperties(input, 'AI 트렌드') as any;
    expect(p['이름'].title[0].text.content).toBe('제목');
    expect(p.status.select.name).toBe('published');
    expect(p.category.multi_select[0].name).toBe('AI 트렌드');
    expect(p.tag.multi_select.map((t: any) => t.name)).toEqual(['AI', 'RSC']);
    expect(typeof p.description.rich_text[0].text.content).toBe('string');
  });
});

describe('createNotionPort', () => {
  it('fetchExistingTitles가 title 프로퍼티에서 제목을 뽑는다', async () => {
    const client = {
      databases: {
        query: async () => ({
          results: [{ properties: { 이름: { title: [{ plain_text: '기존글' }] } } }],
          has_more: false,
          next_cursor: null,
        }),
      },
      pages: { create: async () => ({ id: 'pid', url: 'https://notion/pid' }) },
    };
    const port = createNotionPort(client as any, 'db', 'AI 트렌드');
    expect(await port.fetchExistingTitles()).toEqual(['기존글']);
    const res = await port.createPost(input);
    expect(res).toEqual({ pageId: 'pid', url: 'https://notion/pid' });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/publish.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/publish.ts)**

```ts
import { markdownToBlocks } from '@tryfabric/martian';
import type { NotionPort, PublishInput, PublishResult } from './types';

interface NotionClientLike {
  databases: {
    query: (args: {
      database_id: string;
      start_cursor?: string;
      page_size?: number;
    }) => Promise<{ results: unknown[]; has_more: boolean; next_cursor: string | null }>;
  };
  pages: {
    create: (args: unknown) => Promise<{ id: string; url: string }>;
  };
}

export function buildDescription(markdown: string): string {
  const clean = markdown
    .replace(/[#*>`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .substring(0, 160)
    .trim()
    .replace(/\n/g, ' ');
  return `${clean}...`;
}

export function buildNotionProperties(
  input: PublishInput,
  aiCategory: string,
): Record<string, unknown> {
  return {
    이름: { title: [{ text: { content: input.title } }] },
    status: { select: { name: input.status } },
    category: { multi_select: [{ name: aiCategory }] },
    tag: { multi_select: input.tags.map((t) => ({ name: t })) },
    description: { rich_text: [{ text: { content: buildDescription(input.markdown) } }] },
  };
}

function extractTitleFromPage(page: unknown): string {
  const title = (page as { properties?: { 이름?: { title?: Array<{ plain_text?: string }> } } })
    ?.properties?.이름?.title;
  if (!Array.isArray(title)) return '';
  return title.map((t) => t.plain_text ?? '').join('').trim();
}

export function createNotionPort(
  client: NotionClientLike,
  databaseId: string,
  aiCategory: string,
): NotionPort {
  return {
    async fetchExistingTitles(): Promise<string[]> {
      const titles: string[] = [];
      let cursor: string | undefined;
      do {
        const res = await client.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
          page_size: 100,
        });
        for (const page of res.results) {
          const t = extractTitleFromPage(page);
          if (t) titles.push(t);
        }
        cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
      } while (cursor);
      return titles;
    },
    async createPost(input: PublishInput): Promise<PublishResult> {
      const blocks = markdownToBlocks(input.markdown);
      const res = await client.pages.create({
        parent: { database_id: databaseId },
        properties: buildNotionProperties(input, aiCategory),
        children: blocks,
      });
      return { pageId: res.id, url: res.url };
    },
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/publish.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/publish.ts apps/trend-writer/src/publish.test.ts
git commit -m "feat(trend-writer): Notion 발행 포트 + 제목 조회"
```

---

### Task 12: 알림 모듈

**Files:**
- Create: `apps/trend-writer/src/notify.ts`
- Test: `apps/trend-writer/src/notify.test.ts`

**Interfaces:**
- Consumes: `Notifier` (Task 1).
- Produces: `createNotifier(webhookUrl: string, fetchImpl?: typeof fetch): Notifier`.

- [ ] **Step 1: 실패 테스트 작성 (src/notify.test.ts)**

```ts
import { describe, it, expect, vi } from 'vitest';
import { createNotifier } from './notify';

describe('createNotifier', () => {
  it('webhook 미설정 시 fetch 호출 없이 로깅만', async () => {
    const fetchSpy = vi.fn();
    const notify = createNotifier('', fetchSpy as unknown as typeof fetch);
    await notify('메시지');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('webhook 설정 시 content/text 페이로드로 POST', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true }) as Response);
    const notify = createNotifier('https://hook', fetchSpy as unknown as typeof fetch);
    await notify('메시지');
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hook');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.content).toBe('메시지');
    expect(body.text).toBe('메시지');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter trend-writer test src/notify.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현 (src/notify.ts)**

```ts
import type { Notifier } from './types';

export function createNotifier(webhookUrl: string, fetchImpl: typeof fetch = fetch): Notifier {
  return async (message: string): Promise<void> => {
    if (!webhookUrl) {
      console.log(`[notify] ${message}`);
      return;
    }
    try {
      await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, text: message }),
      });
    } catch (err) {
      console.error('[notify] webhook 실패:', err);
    }
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter trend-writer test src/notify.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/src/notify.ts apps/trend-writer/src/notify.test.ts
git commit -m "feat(trend-writer): 알림 모듈(webhook/로깅)"
```

---

### Task 13: config 로더 + 파이프라인 오케스트레이션

**Files:**
- Create: `apps/trend-writer/src/config.ts`
- Create: `apps/trend-writer/src/index.ts`
- Test: `apps/trend-writer/src/config.test.ts`
- Test: `apps/trend-writer/src/index.test.ts`

**Interfaces:**
- Consumes: 모든 러너(`runScan`, `pickFreshTopic`, `runResearch`, `runWrite`, `runHumanize`, `runVerify`), 포트(`Gemini`, `NotionPort`, `Notifier`), `Config`, `PipelineResult` (Task 1).
- Produces: `loadConfig(env?: NodeJS.ProcessEnv): Config`; `runPipeline(deps: PipelineDeps): Promise<PipelineResult>` where `PipelineDeps = { gemini: Gemini; notion: NotionPort; notify: Notifier; config: Config }`; `main(): Promise<void>`.

- [ ] **Step 1: config 실패 테스트 작성 (src/config.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('필수 값이 없으면 throw', () => {
    expect(() => loadConfig({})).toThrow(/GEMINI_API_KEY/);
  });

  it('기본 모델·카테고리를 채운다', () => {
    const c = loadConfig({
      GEMINI_API_KEY: 'g',
      NOTION_API_KEY: 'n',
      NOTION_DATABASE_ID: 'd',
    });
    expect(c.modelWrite).toBe('gemini-2.5-pro');
    expect(c.modelUtility).toBe('gemini-2.5-flash');
    expect(c.aiCategory).toBe('AI 트렌드');
    expect(c.notifyWebhookUrl).toBe('');
  });
});
```

- [ ] **Step 2: config 실패 확인**

Run: `pnpm --filter trend-writer test src/config.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: config 구현 (src/config.ts)**

```ts
import type { Config } from './types';

function required(env: NodeJS.ProcessEnv, key: string): string {
  const v = env[key];
  if (!v) throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  return v;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    geminiApiKey: required(env, 'GEMINI_API_KEY'),
    notionApiKey: required(env, 'NOTION_API_KEY'),
    notionDatabaseId: required(env, 'NOTION_DATABASE_ID'),
    aiCategory: env.AI_CATEGORY ?? 'AI 트렌드',
    notifyWebhookUrl: env.NOTIFY_WEBHOOK_URL ?? '',
    modelWrite: env.GEMINI_MODEL_WRITE ?? 'gemini-2.5-pro',
    modelUtility: env.GEMINI_MODEL_UTILITY ?? 'gemini-2.5-flash',
  };
}
```

- [ ] **Step 4: config 통과 확인**

Run: `pnpm --filter trend-writer test src/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 파이프라인 실패 테스트 작성 (src/index.test.ts)**

```ts
import { describe, it, expect, vi } from 'vitest';
import { runPipeline } from './index';
import type { Config, Gemini, NotionPort } from './types';

const config: Config = {
  geminiApiKey: 'g', notionApiKey: 'n', notionDatabaseId: 'd',
  aiCategory: 'AI 트렌드', notifyWebhookUrl: '',
  modelWrite: 'w', modelUtility: 'u',
};

function geminiFor(opts: { scan: string; research: string; write: string; humanize: string; verify: string }): Gemini {
  const texts = [opts.write, opts.humanize, opts.verify];
  let i = 0;
  return {
    generateGrounded: vi.fn(async (prompt: string) =>
      prompt.includes('후보') || prompt.includes('동향')
        ? { text: opts.scan, sources: [] }
        : { text: opts.research, sources: ['https://src'] },
    ),
    generateText: vi.fn(async () => texts[i++] ?? ''),
  };
}

const scanJson = '[{"title":"새 주제","whyNow":"w","sources":["https://a"],"area":"frontend"}]';
const researchJson = '{"facts":["사실1"],"sources":["https://r"]}';
const post = '# 새 주제\n\n## 1. 문제의 배경\n본문\n## 6. 마치며\n끝';

function notionFor(titles: string[]): NotionPort {
  return {
    fetchExistingTitles: async () => titles,
    createPost: vi.fn(async () => ({ pageId: 'p', url: 'https://notion/p' })),
  };
}

describe('runPipeline', () => {
  it('정상 흐름: 통과 시 published', async () => {
    const notify = vi.fn(async () => {});
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":true,"reasons":[]}' }),
      notion: notionFor(['다른 글']),
      notify, config,
    });
    expect(res.outcome).toBe('published');
    expect(res.url).toBe('https://notion/p');
  });

  it('전부 중복이면 skipped, 발행 안 함', async () => {
    const notion = notionFor(['새 주제']);
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":true}' }),
      notion, notify: async () => {}, config,
    });
    expect(res.outcome).toBe('skipped');
    expect(notion.createPost).not.toHaveBeenCalled();
  });

  it('검증 실패 시 draft로 발행', async () => {
    const notion = notionFor(['다른 글']);
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":false,"reasons":["근거 부족"]}' }),
      notion, notify: async () => {}, config,
    });
    expect(res.outcome).toBe('draft');
    expect(res.reasons).toContain('근거 부족');
    expect(notion.createPost).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: 파이프라인 실패 확인**

Run: `pnpm --filter trend-writer test src/index.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 7: 파이프라인 구현 (src/index.ts)**

```ts
import { Client } from '@notionhq/client';
import type { Config, Gemini, NotionPort, Notifier, PipelineResult } from './types';
import { loadConfig } from './config';
import { createGemini } from './gemini';
import { createNotifier } from './notify';
import { createNotionPort } from './publish';
import { runScan } from './scan';
import { pickFreshTopic } from './dedup';
import { runResearch } from './research';
import { runWrite } from './write';
import { runHumanize } from './humanize';
import { runVerify } from './verify';

export interface PipelineDeps {
  gemini: Gemini;
  notion: NotionPort;
  notify: Notifier;
  config: Config;
}

export async function runPipeline(deps: PipelineDeps): Promise<PipelineResult> {
  const { gemini, notion, notify, config } = deps;

  const candidates = await runScan(gemini, config.modelUtility);
  const existing = await notion.fetchExistingTitles();
  const topic = pickFreshTopic(candidates, existing);

  if (!topic) {
    await notify('트렌드 스캔 결과가 전부 기존 글과 중복되어 이번 회차를 건너뜁니다.');
    return { outcome: 'skipped' };
  }

  const research = await runResearch(gemini, config.modelUtility, topic);
  const draft = await runWrite(gemini, config.modelWrite, topic, research);
  const humanized = await runHumanize(gemini, config.modelWrite, draft);
  const verdict = await runVerify(gemini, config.modelUtility, humanized, existing);

  const status = verdict.pass ? 'published' : 'draft';
  const result = await notion.createPost({
    title: humanized.title,
    markdown: humanized.markdown,
    tags: humanized.tags,
    status,
  });

  const reasonLine = verdict.pass ? '' : `\n사유: ${verdict.reasons.join('; ')}`;
  await notify(`[${status}] ${humanized.title}\n${result.url}${reasonLine}`);

  return {
    outcome: status,
    title: humanized.title,
    url: result.url,
    reasons: verdict.pass ? undefined : verdict.reasons,
  };
}

export async function main(): Promise<void> {
  const config = loadConfig();
  const gemini = createGemini(config.geminiApiKey);
  const client = new Client({ auth: config.notionApiKey });
  const notion = createNotionPort(
    client as unknown as Parameters<typeof createNotionPort>[0],
    config.notionDatabaseId,
    config.aiCategory,
  );
  const notify = createNotifier(config.notifyWebhookUrl);
  const result = await runPipeline({ gemini, notion, notify, config });
  console.log('[trend-writer] 결과:', JSON.stringify(result));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[trend-writer] 실패:', err);
    process.exit(1);
  });
}
```

- [ ] **Step 8: 전체 테스트 통과 확인**

Run: `pnpm --filter trend-writer test`
Expected: 모든 테스트 PASS (약 30+ tests). 이어서 `pnpm --filter trend-writer typecheck` 실행 → 에러 0.

- [ ] **Step 9: 커밋**

```bash
git add apps/trend-writer/src/config.ts apps/trend-writer/src/config.test.ts apps/trend-writer/src/index.ts apps/trend-writer/src/index.test.ts
git commit -m "feat(trend-writer): config 로더 + 8단계 파이프라인 오케스트레이션"
```

---

### Task 14: Docker 이미지 + 로컬 빌드 검증

**Files:**
- Create: `apps/trend-writer/Dockerfile`
- Create: `apps/trend-writer/.dockerignore`

**Interfaces:**
- Consumes: `main()` 엔트리(Task 13).
- Produces: `node dist/index.js`로 실행되는 자립 컨테이너 이미지.

- [ ] **Step 1: .dockerignore 작성**

```
node_modules
dist
**/node_modules
**/dist
.env
.env.local
**/*.test.ts
```

- [ ] **Step 2: Dockerfile 작성 (모노레포 루트를 빌드 컨텍스트로 사용)**

```dockerfile
# 빌드 스테이지: 모노레포 전체에서 trend-writer만 빌드·추출
FROM node:20-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter trend-writer build
RUN pnpm --filter trend-writer deploy --prod --legacy /app

# 런타임 스테이지: 자립 패키지만
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
CMD ["node", "dist/index.js"]
```

- [ ] **Step 3: 로컬 빌드 검증**

Run (모노레포 루트에서):
```bash
docker build -f apps/trend-writer/Dockerfile -t trend-writer:local .
```
Expected: 빌드 성공. 실패 시(주로 `pnpm deploy` 경로 이슈) 대안: build 스테이지에서 `pnpm --filter trend-writer build` 후 `dist`·루트 `node_modules`를 직접 COPY 하도록 조정.

- [ ] **Step 4: 컨테이너가 env 없이 즉시 실패하는지 확인(설정 검증 동작)**

Run:
```bash
docker run --rm trend-writer:local || echo "예상된 실패(GEMINI_API_KEY 없음)"
```
Expected: `환경변수 GEMINI_API_KEY가 설정되지 않았습니다.` 로그 후 종료 코드 1.

- [ ] **Step 5: 커밋**

```bash
git add apps/trend-writer/Dockerfile apps/trend-writer/.dockerignore
git commit -m "feat(trend-writer): Cloud Run Job용 Docker 이미지"
```

---

### Task 15: GCP 프로비저닝 + 배포 (GCP MCP)

이 태스크의 모든 gcloud 명령은 **`mcp__gcloud__run_gcloud_command`** 로 실행한다. `PROJECT_ID`, `REGION`(예: `asia-northeast3`), 시크릿 실제 값은 사용자에게 확인해 채운다.

**Files:** (코드 변경 없음 — 인프라 프로비저닝)

- [ ] **Step 1: 프로젝트·API 활성화**

```
run gcloud command: config set project PROJECT_ID
run gcloud command: services enable run.googleapis.com cloudscheduler.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com
```
Expected: API 활성화 완료.

- [ ] **Step 2: Artifact Registry 저장소 생성**

```
run gcloud command: artifacts repositories create hooneylog --repository-format=docker --location=REGION --description="trend-writer images"
```

- [ ] **Step 3: 시크릿 생성 (값은 사용자 제공)**

각 시크릿을 생성하고 값을 넣는다(GEMINI_API_KEY, NOTION_API_KEY, NOTION_DATABASE_ID, 선택적으로 NOTIFY_WEBHOOK_URL). 예:
```
run gcloud command: secrets create GEMINI_API_KEY --replication-policy=automatic
run gcloud command: secrets versions add GEMINI_API_KEY --data-file=- <<< "실제값"
```
NOTION_API_KEY, NOTION_DATABASE_ID도 동일 반복. Expected: 각 시크릿 버전 1 생성.

- [ ] **Step 4: 이미지 빌드·푸시 (Cloud Build)**

```
run gcloud command: builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/hooneylog/trend-writer:v1 --file apps/trend-writer/Dockerfile .
```
(루트에서 실행. `--file`로 Dockerfile 지정, 컨텍스트는 모노레포 루트.)
Expected: 이미지 푸시 성공.

- [ ] **Step 5: Cloud Run Job 생성 (시크릿을 env로 주입)**

```
run gcloud command: run jobs create trend-writer --image REGION-docker.pkg.dev/PROJECT_ID/hooneylog/trend-writer:v1 --region REGION --task-timeout=600 --max-retries=1 --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,NOTION_API_KEY=NOTION_API_KEY:latest,NOTION_DATABASE_ID=NOTION_DATABASE_ID:latest --set-env-vars=AI_CATEGORY=AI 트렌드,GEMINI_MODEL_WRITE=gemini-2.5-pro,GEMINI_MODEL_UTILITY=gemini-2.5-flash
```
Expected: Job 생성 완료.

- [ ] **Step 6: 수동 실행으로 엔드투엔드 검증**

```
run gcloud command: run jobs execute trend-writer --region REGION --wait
```
그 후 로그 확인:
```
run gcloud command: logging read "resource.type=cloud_run_job AND resource.labels.job_name=trend-writer" --limit=50 --freshness=10m
```
Expected: 파이프라인 로그와 `[trend-writer] 결과: {"outcome":...}` 출력. Notion에 새 글(published 또는 draft) 생성 및 웹 렌더 확인. 문제 시 이 태스크 안에서 프롬프트·모델 조정 후 이미지 재빌드(`:v2`)·Job 업데이트.

- [ ] **Step 7: Cloud Scheduler cron 연결 (주 2–3회)**

Cloud Run Jobs를 트리거하려면 Run Admin API 엔드포인트를 OAuth로 호출한다.
```
run gcloud command: scheduler jobs create http trend-writer-cron --location REGION --schedule="0 9 * * 1,3,5" --time-zone="Asia/Seoul" --uri="https://REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/PROJECT_ID/jobs/trend-writer:run" --http-method=POST --oauth-service-account-email=PROJECT_NUMBER-compute@developer.gserviceaccount.com
```
Expected: 월·수·금 09:00 KST 스케줄 생성.

- [ ] **Step 8: 스케줄 강제 실행으로 트리거 검증**

```
run gcloud command: scheduler jobs run trend-writer-cron --location REGION
```
Expected: Job이 트리거되어 새 실행 생성(로그로 확인).

- [ ] **Step 9: 배포 문서화 + 커밋**

`apps/trend-writer/README.md`에 배포 파라미터(PROJECT_ID/REGION/이미지 태그/스케줄/시크릿 목록)와 재배포 절차(이미지 재빌드→`run jobs update`)를 기록하고 커밋.
```bash
git add apps/trend-writer/README.md
git commit -m "docs(trend-writer): GCP 배포 절차 기록"
```

---

## Self-Review

**1. Spec coverage:**
- §2 결정(Gemini 단독/자율 스캔/주 2–3회/전용 카테고리+출처/자가검증 게이트/humanize 이식) → Task 2·5·6·8·10·11(카테고리)·4·9(윤문)·15(cron 주2–3회). ✅
- §3 GCP 스택(Cloud Run Job/Scheduler/Secret Manager/Artifact Registry/MCP) → Task 14·15. ✅
- §4 파이프라인 8단계 → Task 5(①)·6(②)·7(③)·8(④)·9(⑤)·10(⑥)·11(⑦)·12(⑧), 오케스트레이션 Task 13. ✅
- §5 데이터 계약(Notion 스키마·6단 구조·마치며 출처+AI안내) → Task 11(properties)·3(구조)·8(footer). ✅
- §6 안전장치 3중(중복 스킵·게이트·1회1글) → Task 13 runPipeline 분기 + index.test.ts 3케이스. ✅
- §7 품질(프롬프트 이식) → Task 3·4. ✅
- §9 미결(알림 webhook/모델 env/cron/신규 카테고리) → Task 12·13(config)·15. 신규 카테고리 웹 렌더 검증은 Task 15 Step 6. ✅

**2. Placeholder scan:** 모든 코드 스텝에 실제 구현 포함. TODO/TBD 없음. gcloud 명령의 `PROJECT_ID/REGION/실제값`은 사용자 환경 고유값으로, Task 15 도입부에 확인 지침 명시(플레이스홀더 아님). ✅

**3. Type consistency:** `Gemini`/`NotionPort`/`Notifier`/`Config` 인터페이스는 Task 1에서 정의하고 이후 모든 태스크가 동일 시그니처로 소비. `runScan/runResearch/runWrite/runHumanize/runVerify`의 인자 순서(`gemini, model, ...`)와 반환 타입이 Task 13 `runPipeline` 호출과 일치. `extractTitle`은 Task 8에서 정의해 Task 9에서 재사용(중복 정의 없음). ✅
