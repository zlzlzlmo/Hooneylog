# Blog Reading Experience (#1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add canonical tech-blog reading affordances to the post detail page — table of contents (sticky desktop rail + mobile collapsible, scroll-spy), heading anchor links, reading time, and code-block copy buttons.

**Architecture:** All changes target the post detail page whose body renders via `MarkdownRenderer` (markdown). Pure logic (TOC extraction, reading time) lives in a testable `utils/toc.ts`. Interactive pieces (TOC scroll-spy, copy button) are small client islands. Heading ids come from `rehype-slug`; TOC slugs are generated with the same `github-slugger` so anchors match.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, react-markdown, react-syntax-highlighter, Vitest + Testing Library.

## Global Constraints

- pnpm 9 from repo root. Run one test file: `pnpm --filter web test -- <path under apps/web>`. Visual/build check: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`.
- Tailwind v4 CSS-first; use existing tokens (`notion-bg/text/border/hover/gray-bg/blue-bg/blue-text`, `accent`, `accent-bg`). No undefined color utilities.
- TypeScript strict; lint forbids `as any` (use `as unknown as T` / typed mocks) and warns on raw `<img>`.
- Korean copy in `습니다`/noun style. Reading time format: `약 N분`.
- New client components must declare `'use client'`.
- `TocItem = { depth: 2 | 3; text: string; slug: string }`.

---

### Task 1: Add dependencies

**Files:**
- Modify: `apps/web/package.json` (deps) + `pnpm-lock.yaml`

**Interfaces:**
- Produces: `rehype-slug` and `github-slugger` available for import.

- [ ] **Step 1: Install**

Run: `pnpm --filter web add rehype-slug github-slugger`
Expected: both added to `apps/web/package.json` dependencies; lockfile updated.

- [ ] **Step 2: Confirm baseline still green**

Run: `pnpm --filter web test`
Expected: existing suite passes.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(web): add rehype-slug and github-slugger for TOC/anchors"
```

---

### Task 2: TOC extraction + reading time (pure utils)

**Files:**
- Create: `apps/web/src/utils/toc.ts`
- Create: `apps/web/src/utils/toc.test.ts`

**Interfaces:**
- Produces:
  - `type TocItem = { depth: 2 | 3; text: string; slug: string }`
  - `extractToc(markdown: string): TocItem[]` — h2/h3 only; slugs via `github-slugger` (one slugger instance per call, in document order, so duplicate headings dedupe identically to rehype-slug); headings inside fenced code blocks are ignored.
  - `readingTime(markdown: string): number` — strip fenced code blocks, count non-whitespace characters, `Math.max(1, Math.ceil(chars / 500))`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/utils/toc.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import GithubSlugger from 'github-slugger';
import { extractToc, readingTime } from './toc';

describe('extractToc', () => {
  it('extracts h2 and h3 with text and depth, ignoring h1 and h4', () => {
    const md = '# Title\n\n## 설치\n\ntext\n\n### 옵션\n\n#### 무시\n';
    const toc = extractToc(md);
    expect(toc).toEqual([
      { depth: 2, text: '설치', slug: '설치' },
      { depth: 3, text: '옵션', slug: '옵션' },
    ]);
  });

  it('generates slugs matching github-slugger for duplicate headings', () => {
    const md = '## Setup\n\n## Setup\n';
    const slugger = new GithubSlugger();
    const expected = [slugger.slug('Setup'), slugger.slug('Setup')];
    expect(extractToc(md).map((t) => t.slug)).toEqual(expected);
  });

  it('ignores headings inside fenced code blocks', () => {
    const md = '## Real\n\n```\n## NotAHeading\n```\n';
    expect(extractToc(md).map((t) => t.text)).toEqual(['Real']);
  });
});

describe('readingTime', () => {
  it('returns at least 1 minute for short content', () => {
    expect(readingTime('짧은 글')).toBe(1);
  });

  it('computes ~500 chars per minute, excluding code blocks', () => {
    const prose = '가'.repeat(1000);
    const code = '\n```js\n' + 'x'.repeat(5000) + '\n```\n';
    expect(readingTime(prose + code)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/utils/toc.test.ts`
Expected: FAIL — `Cannot find module './toc'`.

- [ ] **Step 3: Implement**

Create `apps/web/src/utils/toc.ts`:

```ts
import GithubSlugger from 'github-slugger';

export type TocItem = { depth: 2 | 3; text: string; slug: string };

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

export function extractToc(markdown: string): TocItem[] {
  const body = stripCodeBlocks(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const line of body.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    items.push({ depth, text, slug: slugger.slug(text) });
  }

  return items;
}

export function readingTime(markdown: string): number {
  const text = stripCodeBlocks(markdown);
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / 500));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/utils/toc.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/utils/toc.ts apps/web/src/utils/toc.test.ts
git commit -m "feat(post): add TOC extraction and reading-time utils"
```

---

### Task 3: Heading anchors in the markdown renderer

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx`

**Interfaces:**
- Consumes: `rehype-slug` (Task 1).
- Produces: rendered h1/h2/h3 carry `id`; h2/h3 show a hover `#` anchor link to `#${id}`.

- [ ] **Step 1: Add rehype-slug to the plugin list**

In `markdown-renderer.tsx`, add the import at the top:

```tsx
import rehypeSlug from 'rehype-slug';
```

and change the `rehypePlugins` prop so slug runs after raw:

```tsx
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
```

- [ ] **Step 2: Render anchors on h2/h3 (and id on h1)**

Replace the `h1`, `h2`, `h3` component overrides with versions that consume `id` and render a hover anchor on h2/h3:

```tsx
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h1({ id, children, ...props }: any) {
            return <h1 id={id as string} className="text-[30px] font-bold mt-[2em] mb-[0.5em] leading-[1.3] text-notion-text" {...props}>{children as React.ReactNode}</h1>;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h2({ id, children, ...props }: any) {
            return (
              <h2 id={id as string} className="group/anchor text-[24px] font-semibold mt-[1.6em] mb-[0.4em] leading-[1.3] text-notion-text scroll-mt-[72px]" {...props}>
                {children as React.ReactNode}
                {id && (
                  <a href={`#${id}`} aria-label="이 섹션 링크" className="ml-2 text-notion-secondary opacity-0 group-hover/anchor:opacity-100 transition-opacity no-underline">#</a>
                )}
              </h2>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h3({ id, children, ...props }: any) {
            return (
              <h3 id={id as string} className="group/anchor text-[20px] font-semibold mt-[1.2em] mb-[0.3em] leading-[1.3] text-notion-text scroll-mt-[72px]" {...props}>
                {children as React.ReactNode}
                {id && (
                  <a href={`#${id}`} aria-label="이 섹션 링크" className="ml-2 text-notion-secondary opacity-0 group-hover/anchor:opacity-100 transition-opacity no-underline">#</a>
                )}
              </h3>
            );
          },
```

- [ ] **Step 3: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/markdown-renderer.tsx
git commit -m "feat(post): heading ids via rehype-slug with hover anchor links"
```

---

### Task 4: Code-block copy button

**Files:**
- Create: `apps/web/src/components/blocks/post-detail/code-block.tsx`
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx`

**Interfaces:**
- Produces: `CodeBlock({ code: string; language: string })` — client component rendering the highlighted code with a top-right copy button ("복사" → "복사됨" for ~2s).

- [ ] **Step 1: Create the CodeBlock client component**

Create `apps/web/src/components/blocks/post-detail/code-block.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; no-op
    }
  };

  return (
    <div className="group/code relative my-[1.2em] text-[14px] rounded-[3px] overflow-hidden border border-notion-border font-mono">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? '복사됨' : '코드 복사'}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-[4px] text-[12px] bg-white/10 text-white/80 opacity-0 group-hover/code:opacity-100 hover:bg-white/20 transition-opacity"
      >
        {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        {copied ? '복사됨' : '복사'}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="code-highlighter !m-0 !p-6 overflow-x-auto"
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
```

- [ ] **Step 2: Use CodeBlock in the renderer**

In `markdown-renderer.tsx`, add the import:

```tsx
import { CodeBlock } from './code-block';
```

and replace the fenced-code branch of the `code` component (the `!inline && match ? (...)` block that wraps `SyntaxHighlighter` in a `div`) with:

```tsx
            return !inline && match ? (
              <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
            ) : (
```

(Leave the inline `<code>` else-branch unchanged. The top-of-file `SyntaxHighlighter`/`vscDarkPlus` imports may now be unused in this file — remove them if so to keep lint clean.)

- [ ] **Step 3: Verify lint/typecheck + full tests**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test`
Expected: PASS (no regressions).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/code-block.tsx apps/web/src/components/blocks/post-detail/markdown-renderer.tsx
git commit -m "feat(post): code-block copy button"
```

---

### Task 5: TableOfContents component (scroll-spy)

**Files:**
- Create: `apps/web/src/components/blocks/post-detail/table-of-contents.tsx`

**Interfaces:**
- Consumes: `TocItem` from `@/utils/toc`.
- Produces: `TableOfContents({ items: TocItem[]; variant: 'inline' | 'rail' })` — `inline` renders the mobile `<details>` (visible below xl), `rail` renders the desktop sticky nav (visible at xl+). Rendering one of each in different containers avoids the on-screen duplication that a single both-markup component would cause. IntersectionObserver highlights the active heading; renders nothing if `items` is empty.

- [ ] **Step 1: Create the component**

Create `apps/web/src/components/blocks/post-detail/table-of-contents.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/utils/toc';

function useActiveSlug(items: TocItem[]): string {
  const [activeSlug, setActiveSlug] = useState('');

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return activeSlug;
}

function TocLinks({ items, activeSlug }: { items: TocItem[]; activeSlug: string }) {
  return (
    <ul className="m-0 p-0 list-none space-y-1 text-[13px]">
      {items.map((item) => (
        <li key={item.slug} className={item.depth === 3 ? 'pl-3' : ''}>
          <a
            href={`#${item.slug}`}
            aria-current={activeSlug === item.slug ? 'true' : undefined}
            className={`block py-0.5 no-underline transition-colors ${
              activeSlug === item.slug
                ? 'text-accent font-medium'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ items, variant }: { items: TocItem[]; variant: 'inline' | 'rail' }) {
  const activeSlug = useActiveSlug(items);

  if (items.length === 0) return null;

  if (variant === 'inline') {
    // Mobile: collapsible at top of the reading column (hidden at xl+)
    return (
      <details className="xl:hidden mb-8 rounded-[6px] border border-notion-border bg-notion-gray-bg/40 px-4 py-3">
        <summary className="cursor-pointer text-[14px] font-medium text-notion-text select-none">목차</summary>
        <nav aria-label="목차" className="mt-3">
          <TocLinks items={items} activeSlug={activeSlug} />
        </nav>
      </details>
    );
  }

  // Desktop: sticky rail in the side column (hidden below xl)
  return (
    <nav aria-label="목차" className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto">
      <p className="text-[12px] font-semibold text-notion-secondary uppercase tracking-wider mb-2">목차</p>
      <TocLinks items={items} activeSlug={activeSlug} />
    </nav>
  );
}
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/table-of-contents.tsx
git commit -m "feat(post): table of contents with scroll-spy"
```

---

### Task 6: Reading time in the post header

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/post-header.tsx`

**Interfaces:**
- Consumes: a new `readingMinutes: number` prop.
- Produces: `PostHeader` displays `약 N분` next to date/views.

- [ ] **Step 1: Add the prop and render it**

In `post-header.tsx`, add `readingMinutes: number` to `PostHeaderProps`, destructure it, and add a reading-time span in the meta row (after `ViewCounter`):

```tsx
interface PostHeaderProps {
  title: string;
  category: string;
  createdAt: string;
  tags: ITag[];
  slug: string;
  initialViews: number;
  readingMinutes: number;
}
```

```tsx
export function PostHeader({ title, category, createdAt, slug, initialViews, readingMinutes }: PostHeaderProps) {
```

In the meta row `<div className="flex items-center gap-2 text-notion-secondary font-mono">`, after the `<ViewCounter ... />`:

```tsx
            <span className="text-notion-border">•</span>
            <span>약 {readingMinutes}분</span>
```

- [ ] **Step 2: Verify typecheck (page.tsx will error until Task 7 passes the prop — that is expected; do not pass yet)**

Run: `pnpm --filter web typecheck`
Expected: FAIL with a missing-prop error at `post/[slug]/page.tsx` where `<PostHeader>` is rendered. This is expected and fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/post-header.tsx
git commit -m "feat(post): show reading time in post header"
```

---

### Task 7: Wire TOC + reading time into the post page (layout)

**Files:**
- Modify: `apps/web/src/app/post/[slug]/page.tsx`

**Interfaces:**
- Consumes: `extractToc`, `readingTime` (`@/utils/toc`); `TableOfContents`; `PostHeader.readingMinutes`.

- [ ] **Step 1: Import and compute**

In `page.tsx`, add imports:

```tsx
import { TableOfContents } from '@/components/blocks/post-detail/table-of-contents';
import { extractToc, readingTime } from '@/utils/toc';
```

After `const markdown = ...` is available (inside the component, after the `notFound()` guard), compute:

```tsx
  const md = markdown.parent ?? '';
  const toc = extractToc(md);
  const readingMinutes = readingTime(md);
```

- [ ] **Step 2: Pass readingMinutes to PostHeader**

Update the `<PostHeader ... />` usage to add:

```tsx
            readingMinutes={readingMinutes}
```

- [ ] **Step 3: Restructure the body into a grid with the TOC rail**

Replace the inner container (the `<div className="w-full max-w-[720px] ...">` block, lines ~115-139) with a layout that keeps the 720px reading column and adds an xl TOC rail. Use `md` in the renderer instead of re-reading:

```tsx
      <div className="w-full max-w-[980px] px-4 sm:px-6 mx-auto">
        {/* Top: header spans the reading column width */}
        <div className="max-w-[720px] mx-auto xl:mx-0">
          <section className="w-full mb-12">
            <PostHeader
              title={post.title}
              category={post.category}
              createdAt={post.createdAt}
              tags={post.tags}
              slug={slug}
              initialViews={views}
              readingMinutes={readingMinutes}
            />
          </section>
        </div>

        <div className="xl:grid xl:grid-cols-[1fr_220px] xl:gap-10 items-start">
          {/* Reading column */}
          <div className="max-w-[720px] w-full mx-auto xl:mx-0 min-w-0">
            <TableOfContents items={toc} variant="inline" />
            <section className="w-full">
              <MarkdownRenderer content={md} />
              <MoveToAnotherPost previousPost={previousPost ?? null} nextPost={nextPost ?? null} />
              <CommentProvider>
                <GiscusComment />
              </CommentProvider>
            </section>
          </div>

          {/* TOC rail (desktop only) */}
          <aside className="hidden xl:block">
            <TableOfContents items={toc} variant="rail" />
          </aside>
        </div>
      </div>
```

Note: the `inline` variant (mobile `<details>`, `xl:hidden`) sits in the reading column; the `rail` variant lives in the `<aside>` which is itself `hidden xl:block`. Each shows only at its breakpoint, so there is no on-screen duplication.

- [ ] **Step 4: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS (the Task 6 prop error is now resolved).

- [ ] **Step 5: Manual check**

`pnpm --filter web dev`, open a post with multiple `##`/`###` headings: TOC rail on wide screens with scroll-spy highlight; "목차" collapsible on narrow; "#" appears on heading hover and jumps with header offset; "약 N분" in the header; copy button on code blocks.

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/app/post/[slug]/page.tsx"
git commit -m "feat(post): wire TOC rail + reading time into post layout"
```

---

## Final Verification

- [ ] **Full check**

Run: `pnpm --filter web test && pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: all PASS.

## Spec Coverage Map

| Spec item (#1) | Task |
|---|---|
| Heading anchors (rehype-slug + `#`) | Task 3 |
| TOC extraction (slug matches) | Task 2 |
| TableOfContents (rail + mobile, scroll-spy) | Tasks 5, 7 |
| Reading time (Korean char-based) | Tasks 2, 6 |
| Code copy button | Task 4 |
| Layout (720 column + xl rail) | Task 7 |
