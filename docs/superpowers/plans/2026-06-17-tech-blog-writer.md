# tech-blog-writer Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code skill that interviews the author about a topic, drafts a Korean tech-blog post in standard industry tone, lightly fact-checks it, and publishes it to the Notion DB on approval.

**Architecture:** A modular skill (`SKILL.md` + `references/` + `scripts/`) using progressive disclosure. The publish path is a small ESM Node program split into pure, unit-tested modules (`lib/properties.js`, `lib/blocks.js`, `lib/publish.js`) behind a thin CLI (`publish_to_notion.js`). The skill prose orchestrates interview → draft → verify → approve → publish.

**Tech Stack:** Node 24 (ESM), `@notionhq/client` ^2.3.0 (v2 API), `@tryfabric/martian` ^1.2.4 (markdown → Notion blocks), `node:test` + `node:assert/strict` for tests.

## Global Constraints

- Runtime: Node 24, ESM (`"type": "module"`). Use `import`, not `require`.
- Dependencies live ONLY in `.claude/skills/tech-blog-writer/scripts/package.json`, isolated from the monorepo (root `node_modules` is not installed). Pin `@notionhq/client@^2.3.0` and `@tryfabric/martian@^1.2.4` to match `apps/web`.
- Notion DB property names (exact, including Korean): title=`이름`, `category` (multi_select), `tag` (multi_select), `description` (rich_text), `status` (select). `created_date` is auto; `image`/`slug` are out of scope.
- `category` MUST be exactly one of: `Frontend`, `Backend`, `Artificial Intelligence`.
- `status` MUST be exactly one of: `writing`, `ready`, `published`. Default `published`.
- Notion API allows at most 100 child blocks per `pages.create` / `blocks.children.append` request.
- Credentials come from `apps/web/.env.local` (`NOTION_API_KEY`, `NOTION_DATABASE_ID`), loaded via `process.loadEnvFile`. Never print secret values.
- Writing tone: Korean standard tech-blog tone (존댓말, 겸손, 두괄식, 회고형, AI 슬롭 회피) per `references/korean-writing.md`.
- Tests run from the scripts dir with `node --test`.

---

### Task 1: Scaffold scripts package and test harness

**Files:**
- Create: `.claude/skills/tech-blog-writer/scripts/package.json`
- Create: `.claude/skills/tech-blog-writer/scripts/.gitignore`
- Create: `.claude/skills/tech-blog-writer/scripts/test/smoke.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: an installed, runnable test harness (`node --test`) and the two pinned dependencies for later tasks.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "tech-blog-writer-scripts",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Publish helper for the tech-blog-writer skill",
  "dependencies": {
    "@notionhq/client": "^2.3.0",
    "@tryfabric/martian": "^1.2.4"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
*.tmp.json
```

- [ ] **Step 3: Create a smoke test** at `scripts/test/smoke.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test harness runs', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 4: Install dependencies**

Run: `cd .claude/skills/tech-blog-writer/scripts && npm install`
Expected: `node_modules/` created, exit code 0.

- [ ] **Step 5: Run the smoke test**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test`
Expected: PASS — `tests 1`, `pass 1`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/tech-blog-writer/scripts/package.json \
        .claude/skills/tech-blog-writer/scripts/package-lock.json \
        .claude/skills/tech-blog-writer/scripts/.gitignore \
        .claude/skills/tech-blog-writer/scripts/test/smoke.test.js
git commit -m "chore(skill): scaffold tech-blog-writer publish scripts"
```

---

### Task 2: Notion property builder

**Files:**
- Create: `.claude/skills/tech-blog-writer/scripts/lib/properties.js`
- Test: `.claude/skills/tech-blog-writer/scripts/test/properties.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `CATEGORIES = ['Frontend', 'Backend', 'Artificial Intelligence']`
  - `STATUSES = ['writing', 'ready', 'published']`
  - `buildPageProperties({ title, category, tags = [], description = '', status = 'published' })` → Notion `properties` object. Throws `Error` on empty title, invalid category, or invalid status.

- [ ] **Step 1: Write the failing test** at `scripts/test/properties.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPageProperties, CATEGORIES, STATUSES } from '../lib/properties.js';

test('builds Notion properties with Korean field names', () => {
  const props = buildPageProperties({
    title: 'Next.js 16 캐싱 회고',
    category: 'Frontend',
    tags: ['Next.js', 'Cache Components'],
    description: '암묵적 캐싱 폐기 적용기',
    status: 'published',
  });
  assert.deepEqual(props['이름'], { title: [{ text: { content: 'Next.js 16 캐싱 회고' } }] });
  assert.deepEqual(props.category, { multi_select: [{ name: 'Frontend' }] });
  assert.deepEqual(props.tag, { multi_select: [{ name: 'Next.js' }, { name: 'Cache Components' }] });
  assert.deepEqual(props.description, { rich_text: [{ text: { content: '암묵적 캐싱 폐기 적용기' } }] });
  assert.deepEqual(props.status, { select: { name: 'published' } });
});

test('defaults status to published and tags/description to empty', () => {
  const props = buildPageProperties({ title: 'T', category: 'Backend' });
  assert.deepEqual(props.status, { select: { name: 'published' } });
  assert.deepEqual(props.tag, { multi_select: [] });
  assert.deepEqual(props.description, { rich_text: [] });
});

test('rejects empty title, invalid category, invalid status', () => {
  assert.throws(() => buildPageProperties({ title: '', category: 'Frontend' }), /title/);
  assert.throws(() => buildPageProperties({ title: 'T', category: 'frontend' }), /category/);
  assert.throws(() => buildPageProperties({ title: 'T', category: 'Backend', status: 'live' }), /status/);
});

test('exports the allowed category and status lists', () => {
  assert.deepEqual(CATEGORIES, ['Frontend', 'Backend', 'Artificial Intelligence']);
  assert.deepEqual(STATUSES, ['writing', 'ready', 'published']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/properties.test.js`
Expected: FAIL — cannot resolve `../lib/properties.js`.

- [ ] **Step 3: Write minimal implementation** at `scripts/lib/properties.js`

```js
export const CATEGORIES = ['Frontend', 'Backend', 'Artificial Intelligence'];
export const STATUSES = ['writing', 'ready', 'published'];

export function buildPageProperties({ title, category, tags = [], description = '', status = 'published' }) {
  if (!title || !title.trim()) throw new Error('title is required and must be non-empty');
  if (!CATEGORIES.includes(category)) throw new Error(`category must be one of ${CATEGORIES.join(', ')} (got: ${category})`);
  if (!STATUSES.includes(status)) throw new Error(`status must be one of ${STATUSES.join(', ')} (got: ${status})`);

  return {
    '이름': { title: [{ text: { content: title } }] },
    category: { multi_select: [{ name: category }] },
    tag: { multi_select: tags.map((name) => ({ name })) },
    description: { rich_text: description ? [{ text: { content: description } }] : [] },
    status: { select: { name: status } },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/properties.test.js`
Expected: PASS — `pass 4`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/tech-blog-writer/scripts/lib/properties.js \
        .claude/skills/tech-blog-writer/scripts/test/properties.test.js
git commit -m "feat(skill): add Notion property builder with validation"
```

---

### Task 3: Markdown → block chunks

**Files:**
- Create: `.claude/skills/tech-blog-writer/scripts/lib/blocks.js`
- Test: `.claude/skills/tech-blog-writer/scripts/test/blocks.test.js`

**Interfaces:**
- Consumes: `@tryfabric/martian` `markdownToBlocks`.
- Produces:
  - `chunkBlocks(blocks, size = 100)` → array of arrays, each ≤ `size`.
  - `markdownToBlockChunks(markdown, size = 100)` → `{ initial: Block[], rest: Block[][] }` where `initial` ≤ `size` and each entry of `rest` ≤ `size`.

- [ ] **Step 1: Write the failing test** at `scripts/test/blocks.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkBlocks, markdownToBlockChunks } from '../lib/blocks.js';

test('chunkBlocks splits into groups no larger than size', () => {
  const arr = Array.from({ length: 250 }, (_, i) => i);
  const chunks = chunkBlocks(arr, 100);
  assert.equal(chunks.length, 3);
  assert.deepEqual(chunks.map((c) => c.length), [100, 100, 50]);
});

test('chunkBlocks returns empty array for empty input', () => {
  assert.deepEqual(chunkBlocks([], 100), []);
});

test('markdownToBlockChunks converts markdown and separates initial/rest', () => {
  const md = '# 제목\n\n첫 단락입니다.\n\n```js\nconst a = 1;\n```';
  const { initial, rest } = markdownToBlockChunks(md);
  assert.ok(initial.length >= 1);
  assert.ok(initial.length <= 100);
  assert.ok(Array.isArray(rest));
  assert.equal(initial[0].type, 'heading_1');
});

test('markdownToBlockChunks splits >100 blocks into initial + rest', () => {
  const md = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  const { initial, rest } = markdownToBlockChunks(md);
  assert.equal(initial.length, 100);
  assert.equal(rest.length, 1);
  assert.ok(rest[0].length <= 100);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/blocks.test.js`
Expected: FAIL — cannot resolve `../lib/blocks.js`.

- [ ] **Step 3: Write minimal implementation** at `scripts/lib/blocks.js`

```js
import { markdownToBlocks } from '@tryfabric/martian';

export function chunkBlocks(blocks, size = 100) {
  const chunks = [];
  for (let i = 0; i < blocks.length; i += size) {
    chunks.push(blocks.slice(i, i + size));
  }
  return chunks;
}

export function markdownToBlockChunks(markdown, size = 100) {
  const blocks = markdownToBlocks(markdown);
  const chunks = chunkBlocks(blocks, size);
  return { initial: chunks[0] ?? [], rest: chunks.slice(1) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/blocks.test.js`
Expected: PASS — `pass 4`, `fail 0`.

> Note: if martian splits a 150-item list differently than 1:1 blocks, adjust the expected counts in the last test to match actual block output (the invariant that matters is each chunk ≤ 100). Keep the assertion `initial.length === 100` only if martian yields ≥ 100 top-level blocks; otherwise assert `initial.length <= 100` and total reconstructed length is preserved.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/tech-blog-writer/scripts/lib/blocks.js \
        .claude/skills/tech-blog-writer/scripts/test/blocks.test.js
git commit -m "feat(skill): add markdown-to-Notion block chunking"
```

---

### Task 4: Publish orchestration

**Files:**
- Create: `.claude/skills/tech-blog-writer/scripts/lib/publish.js`
- Test: `.claude/skills/tech-blog-writer/scripts/test/publish.test.js`

**Interfaces:**
- Consumes: `buildPageProperties` (Task 2), `markdownToBlockChunks` (Task 3).
- Produces: `async createPost(notion, databaseId, input)` where `input = { title, category, tags, description, markdown, status }`. Creates the page with the initial ≤100 blocks, then appends each remaining chunk. Returns `{ id, url }`. `notion` is any object exposing `pages.create` and `blocks.children.append` (the real `@notionhq/client` `Client` or a test double).

- [ ] **Step 1: Write the failing test** at `scripts/test/publish.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPost } from '../lib/publish.js';

function mockNotion(calls) {
  return {
    pages: {
      create: async (args) => {
        calls.create.push(args);
        return { id: 'page-123', url: 'https://notion.so/page-123' };
      },
    },
    blocks: {
      children: {
        append: async (args) => {
          calls.append.push(args);
          return {};
        },
      },
    },
  };
}

test('createPost creates page with properties and initial blocks, returns id/url', async () => {
  const calls = { create: [], append: [] };
  const notion = mockNotion(calls);
  const result = await createPost(notion, 'db-1', {
    title: '제목', category: 'Frontend', tags: ['React'], description: '요약',
    markdown: '# 제목\n\n본문입니다.', status: 'published',
  });
  assert.deepEqual(result, { id: 'page-123', url: 'https://notion.so/page-123' });
  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].parent.database_id, 'db-1');
  assert.deepEqual(calls.create[0].properties.category, { multi_select: [{ name: 'Frontend' }] });
  assert.ok(Array.isArray(calls.create[0].children));
  assert.equal(calls.append.length, 0);
});

test('createPost appends overflow chunks beyond 100 blocks', async () => {
  const calls = { create: [], append: [] };
  const notion = mockNotion(calls);
  const markdown = Array.from({ length: 150 }, (_, i) => `- 항목 ${i}`).join('\n');
  await createPost(notion, 'db-1', {
    title: '긴 글', category: 'Backend', markdown,
  });
  assert.equal(calls.create.length, 1);
  assert.ok(calls.create[0].children.length <= 100);
  assert.ok(calls.append.length >= 1);
  for (const call of calls.append) {
    assert.equal(call.block_id, 'page-123');
    assert.ok(call.children.length <= 100);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/publish.test.js`
Expected: FAIL — cannot resolve `../lib/publish.js`.

- [ ] **Step 3: Write minimal implementation** at `scripts/lib/publish.js`

```js
import { buildPageProperties } from './properties.js';
import { markdownToBlockChunks } from './blocks.js';

export async function createPost(notion, databaseId, input) {
  if (!databaseId) throw new Error('databaseId is required (NOTION_DATABASE_ID not set?)');

  const { title, category, tags, description, status, markdown } = input;
  const properties = buildPageProperties({ title, category, tags, description, status });
  const { initial, rest } = markdownToBlockChunks(markdown ?? '');

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
    children: initial,
  });

  for (const chunk of rest) {
    await notion.blocks.children.append({ block_id: page.id, children: chunk });
  }

  return { id: page.id, url: page.url };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/publish.test.js`
Expected: PASS — `pass 2`, `fail 0`.

- [ ] **Step 5: Run the full suite**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test`
Expected: PASS — all tests from Tasks 1–4 green.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/tech-blog-writer/scripts/lib/publish.js \
        .claude/skills/tech-blog-writer/scripts/test/publish.test.js
git commit -m "feat(skill): add Notion publish orchestration with block append"
```

---

### Task 5: CLI entry point

**Files:**
- Create: `.claude/skills/tech-blog-writer/scripts/lib/input.js`
- Create: `.claude/skills/tech-blog-writer/scripts/publish_to_notion.js`
- Test: `.claude/skills/tech-blog-writer/scripts/test/input.test.js`

**Interfaces:**
- Consumes: `createPost` (Task 4), `@notionhq/client` `Client`.
- Produces:
  - `parseInput(jsonText)` → validated input object `{ title, category, tags, description, markdown, status }`. Throws on invalid JSON or missing `title`/`category`/`markdown`.
  - CLI: `node publish_to_notion.js <input.json>` — loads env from `apps/web/.env.local`, creates the post, prints `{ id, url }` as JSON to stdout.

- [ ] **Step 1: Write the failing test** at `scripts/test/input.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../lib/input.js';

test('parseInput accepts a valid payload and fills defaults', () => {
  const out = parseInput(JSON.stringify({
    title: '제목', category: 'Frontend', markdown: '# 제목',
  }));
  assert.equal(out.title, '제목');
  assert.equal(out.category, 'Frontend');
  assert.equal(out.status, 'published');
  assert.deepEqual(out.tags, []);
  assert.equal(out.description, '');
});

test('parseInput throws on invalid JSON', () => {
  assert.throws(() => parseInput('{not json'), /JSON/);
});

test('parseInput throws when required fields are missing', () => {
  assert.throws(() => parseInput(JSON.stringify({ category: 'Frontend', markdown: 'x' })), /title/);
  assert.throws(() => parseInput(JSON.stringify({ title: 'T', markdown: 'x' })), /category/);
  assert.throws(() => parseInput(JSON.stringify({ title: 'T', category: 'Frontend' })), /markdown/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/input.test.js`
Expected: FAIL — cannot resolve `../lib/input.js`.

- [ ] **Step 3: Write `lib/input.js`**

```js
export function parseInput(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`input is not valid JSON: ${err.message}`);
  }
  if (!data.title || !String(data.title).trim()) throw new Error('input.title is required');
  if (!data.category) throw new Error('input.category is required');
  if (!data.markdown || !String(data.markdown).trim()) throw new Error('input.markdown is required');

  return {
    title: data.title,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    description: data.description ?? '',
    markdown: data.markdown,
    status: data.status ?? 'published',
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test test/input.test.js`
Expected: PASS — `pass 3`, `fail 0`.

- [ ] **Step 5: Write the CLI** at `scripts/publish_to_notion.js`

```js
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from '@notionhq/client';
import { createPost } from './lib/publish.js';
import { parseInput } from './lib/input.js';

function loadEnv() {
  // Resolve apps/web/.env.local from the repo root (assumes invocation from repo root).
  const envPath = path.resolve(process.cwd(), 'apps/web/.env.local');
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Fall back to whatever is already in process.env.
  }
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node publish_to_notion.js <input.json>');
    process.exit(1);
  }

  loadEnv();
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!apiKey || !databaseId) {
    console.error('NOTION_API_KEY / NOTION_DATABASE_ID not found (checked apps/web/.env.local and process.env).');
    process.exit(1);
  }

  const input = parseInput(fs.readFileSync(inputPath, 'utf8'));
  const notion = new Client({ auth: apiKey });

  try {
    const result = await createPost(notion, databaseId, input);
    console.log(JSON.stringify(result));
  } catch (err) {
    console.error(`Publish failed: ${err.message}`);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 6: Verify the CLI guards run without network**

Run: `cd /Users/seunghun/Documents/Hooneylog && node .claude/skills/tech-blog-writer/scripts/publish_to_notion.js`
Expected: prints `Usage: ...`, exit code 1 (no input path given).

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/tech-blog-writer/scripts/lib/input.js \
        .claude/skills/tech-blog-writer/scripts/publish_to_notion.js \
        .claude/skills/tech-blog-writer/scripts/test/input.test.js
git commit -m "feat(skill): add publish CLI entry with env loading and input validation"
```

---

### Task 6: Author the reference files

**Files:**
- Create: `.claude/skills/tech-blog-writer/references/korean-writing.md`
- Create: `.claude/skills/tech-blog-writer/references/frontend.md`
- Create: `.claude/skills/tech-blog-writer/references/backend.md`
- Create: `.claude/skills/tech-blog-writer/references/ai-rag.md`
- Source: `docs/research/tech-blog-trends-2026.md` (already committed)

**Interfaces:**
- Consumes: the research report sections.
- Produces: four self-contained reference docs the skill loads on demand.

- [ ] **Step 1: Create `references/korean-writing.md`** — copy section **§7 한국어 기술블로그 작문 가이드** from `docs/research/tech-blog-trends-2026.md` verbatim (the `## 7.` heading through the end of its "추천 출처" list). Prepend this header:

```markdown
# 한국어 기술블로그 작문 가이드

> tech-blog-writer 스킬이 초안 작성·교정 시 항상 로드하는 톤/구조 레퍼런스.
> 출처: docs/research/tech-blog-trends-2026.md §7 (2026-06 스냅샷).
```

- [ ] **Step 2: Create `references/frontend.md`** — copy sections **§1 (프론트엔드 — 프레임워크/렌더링)** and **§2 (프론트엔드 — 툴링/성능/품질)** verbatim. Prepend:

```markdown
# 프론트엔드 트렌드·표준 레퍼런스 (2026)

> category=Frontend 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §1·§2 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.
```

- [ ] **Step 3: Create `references/backend.md`** — copy sections **§3 (백엔드 — 아키텍처/API)** and **§4 (백엔드 — 런타임/데이터/인프라)** verbatim. Prepend:

```markdown
# 백엔드 트렌드·표준 레퍼런스 (2026)

> category=Backend 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §3·§4 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.
```

- [ ] **Step 4: Create `references/ai-rag.md`** — copy sections **§5 (AI 개발 — RAG)** and **§6 (AI 개발 — LLM 앱/에이전트)** verbatim. Prepend:

```markdown
# AI·RAG 트렌드·표준 레퍼런스 (2026)

> category=Artificial Intelligence 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §5·§6 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.
```

- [ ] **Step 5: Verify each file is non-empty and self-contained**

Run: `wc -l .claude/skills/tech-blog-writer/references/*.md`
Expected: four files, each with substantive content (korean-writing ≥ 40 lines; the others ≥ 60 lines each).

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/tech-blog-writer/references/
git commit -m "docs(skill): add category and Korean-writing reference docs"
```

---

### Task 7: Author SKILL.md

**Files:**
- Create: `.claude/skills/tech-blog-writer/SKILL.md`

**Interfaces:**
- Consumes: `references/*.md`, `scripts/publish_to_notion.js`.
- Produces: the skill entry point with YAML frontmatter (name + trigger description) and the full workflow.

- [ ] **Step 1: Write `SKILL.md`** with this exact content:

````markdown
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
````

- [ ] **Step 2: Validate frontmatter parses**

Run: `head -5 .claude/skills/tech-blog-writer/SKILL.md`
Expected: shows the `---` frontmatter with `name: tech-blog-writer` and a `description:` line.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/tech-blog-writer/SKILL.md
git commit -m "feat(skill): add tech-blog-writer SKILL.md workflow"
```

---

### Task 8: Integration smoke test and dry run

**Files:**
- Temporary: `.tmp-smoke-post.json` (repo root, deleted at end)

**Interfaces:**
- Consumes: the full skill + publish CLI.
- Produces: confirmation that publishing creates a real Notion page (as `writing`, then archived) without polluting `published`.

- [ ] **Step 1: Create a throwaway input** at repo root `.tmp-smoke-post.json`

```json
{
  "title": "[SMOKE TEST] tech-blog-writer 발행 확인",
  "category": "Frontend",
  "tags": ["test"],
  "description": "스모크 테스트 — 삭제 예정",
  "markdown": "## 스모크 테스트\n\n이 글은 발행 파이프라인 확인용입니다.\n\n```js\nconsole.log('hello');\n```\n",
  "status": "writing"
}
```

- [ ] **Step 2: Run the publisher** (creates a `writing` page — NOT visible on the site, which only shows `published`)

Run: `cd /Users/seunghun/Documents/Hooneylog && node .claude/skills/tech-blog-writer/scripts/publish_to_notion.js .tmp-smoke-post.json`
Expected: prints `{"id":"...","url":"https://www.notion.so/..."}`, exit 0.

- [ ] **Step 3: Verify the page exists with correct properties**

Run (replace `<PAGE_ID>` with the returned id):
```bash
cd /Users/seunghun/Documents/Hooneylog/apps/web && set -a && . ./.env.local && set +a && \
curl -s "https://api.notion.com/v1/pages/<PAGE_ID>" -H "Authorization: Bearer $NOTION_API_KEY" -H "Notion-Version: 2022-06-28" | \
python3 -c "import json,sys;d=json.load(sys.stdin);p=d['properties'];print('status:',p['status']['select']['name']);print('category:',[o['name'] for o in p['category']['multi_select']]);print('title:',p['이름']['title'][0]['plain_text'])"
```
Expected: `status: writing`, `category: ['Frontend']`, title matches.

- [ ] **Step 4: Archive (soft-delete) the smoke page**

Run (replace `<PAGE_ID>`):
```bash
cd /Users/seunghun/Documents/Hooneylog/apps/web && set -a && . ./.env.local && set +a && \
curl -s -X PATCH "https://api.notion.com/v1/pages/<PAGE_ID>" -H "Authorization: Bearer $NOTION_API_KEY" -H "Notion-Version: 2022-06-28" -H "Content-Type: application/json" -d '{"archived": true}' -o /dev/null -w "HTTP %{http_code}\n"
```
Expected: `HTTP 200`.

- [ ] **Step 5: Delete the temp file**

Run: `rm -f /Users/seunghun/Documents/Hooneylog/.tmp-smoke-post.json`
Expected: no output, file gone.

- [ ] **Step 6: Run the full unit suite one more time**

Run: `cd .claude/skills/tech-blog-writer/scripts && node --test`
Expected: all green.

- [ ] **Step 7: Final commit (if any tracked changes remain)**

```bash
git add -A
git commit -m "test(skill): verify tech-blog-writer publish pipeline end-to-end" || echo "nothing to commit"
```

---

## Notes for the implementer
- Run everything from the repo root unless a step says otherwise; the CLI resolves `apps/web/.env.local` from `process.cwd()`.
- If `martian`'s block output counts differ from the test expectations in Task 3, keep the ≤100-per-chunk invariant and adjust the exact-count assertions to the observed output (documented inline in that task).
- The smoke test in Task 8 writes to the real Notion DB as `writing` and archives it; it never creates a `published` page, so the live site is never touched.
