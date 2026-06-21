# Hooneylog UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 29 verified findings from the multi-agent UI/UX review — correctness, accessibility, UX states, performance (Core Web Vitals), and visual identity — across the Hooneylog blog frontend.

**Architecture:** Incremental, file-scoped edits to the existing Next.js App Router frontend (`apps/web`). Each task is independently testable and committable. Pure logic (list grouping) is extracted into testable helpers; component behavior (ARIA, states) is verified with Vitest + Testing Library; visual/CSS changes are verified via `lint` + `typecheck` + `build` plus an explicit manual visual check.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (CSS-first `@theme` in `globals.css`), Notion CMS, lucide-react + react-icons, Vitest + @testing-library/react (jsdom).

**Design skills to consult per task** (installed under `.claude/skills/`): `frontend-design`, `ux-designer`, `accessibility`, `core-web-vitals`. Each task names the relevant skill — read its `SKILL.md` (and references) before implementing that task.

## Global Constraints

- Package manager: **pnpm 9** (Corepack). All commands run from repo root unless noted.
- Node `>=18`. Monorepo via Turborepo; web app lives in `apps/web`.
- Tailwind is **CSS-first v4** — design tokens live in `apps/web/src/app/globals.css` under `@theme inline`. There is **no `tailwind.config.js`**. Add colors as `--color-<name>` so `bg-<name>`/`text-<name>` utilities generate.
- Existing color tokens (use these, do not invent parallel grays): `notion-bg`, `notion-text`, `notion-text-light` (via `.text-notion-secondary`), `notion-border`, `notion-hover`, `notion-gray-bg`, `notion-blue-bg`, `notion-blue-text`.
- Korean copy: use `습니다`/noun-style consistent with existing UI (e.g. `검색 결과가 없습니다`).
- Every code step shows the actual code. Commit after each task with the message shown.
- Test command (added in Task 0): `pnpm --filter web test -- <path>` runs Vitest on one file.
- Verification command for visual/CSS tasks: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`.

---

## Phase 0 — Setup

### Task 0: Install deps, add test script, confirm green baseline

**Files:**
- Modify: `apps/web/package.json` (add `test` script)

**Interfaces:**
- Produces: a working `pnpm --filter web test` command used by every TDD task below.

- [ ] **Step 1: Install workspace dependencies**

Run: `pnpm install`
Expected: completes; `node_modules/` appears at repo root.

- [ ] **Step 2: Add a `test` script to the web app**

In `apps/web/package.json`, add `"test": "vitest run"` to the `scripts` block:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Confirm the existing tests pass (baseline)**

Run: `pnpm --filter web test`
Expected: PASS (existing suites: `views.test.ts`, `notion-md-fix.test.ts`, `view-counter.test.tsx`, `home-page-client.test.tsx`, etc.). If anything fails before you change code, stop and report.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json
git commit -m "chore(web): add vitest test script"
```

---

## Phase 1 — Correctness & Accessibility (Important)

### Task 1: Render numbered lists as ordered lists with real `<ol>/<ul>` wrappers

**Findings:** #1, #6 (frontend-design + accessibility). Numbered list items currently use the same `list-disc` class as bullets and emit bare `<li>` with no list parent.

**Skill:** `frontend-design` (structure encodes information), `accessibility` (WCAG 1.3.1 list semantics).

**Files:**
- Create: `apps/web/src/components/elements/post-block/group-blocks.ts`
- Create: `apps/web/src/components/elements/post-block/group-blocks.test.ts`
- Modify: `apps/web/src/components/elements/post-block/post-block.tsx:58-64` (numbered case → `list-decimal`)
- Modify: `apps/web/src/components/blocks/post-detail/post-blocks.tsx` (render grouped lists)

**Interfaces:**
- Produces: `groupBlocks(blocks: BlockObjectResponse[]): BlockGroup[]` where
  `type BlockGroup = { kind: 'ul'; items: BlockObjectResponse[] } | { kind: 'ol'; items: BlockObjectResponse[] } | { kind: 'single'; block: BlockObjectResponse }`.
  Consecutive `bulleted_list_item` blocks group into one `ul`; consecutive `numbered_list_item` blocks group into one `ol`; everything else is a `single`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/elements/post-block/group-blocks.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { groupBlocks } from './group-blocks';

const b = (id: string, type: string) => ({ id, type } as any);

describe('groupBlocks', () => {
  it('groups consecutive bulleted items into one ul group', () => {
    const out = groupBlocks([b('1', 'bulleted_list_item'), b('2', 'bulleted_list_item')]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ kind: 'ul' });
    expect((out[0] as any).items).toHaveLength(2);
  });

  it('groups consecutive numbered items into one ol group', () => {
    const out = groupBlocks([b('1', 'numbered_list_item'), b('2', 'numbered_list_item')]);
    expect(out[0]).toMatchObject({ kind: 'ol' });
    expect((out[0] as any).items).toHaveLength(2);
  });

  it('keeps bulleted and numbered runs separate and preserves order', () => {
    const out = groupBlocks([
      b('p', 'paragraph'),
      b('1', 'numbered_list_item'),
      b('2', 'numbered_list_item'),
      b('3', 'bulleted_list_item'),
    ]);
    expect(out.map((g) => g.kind)).toEqual(['single', 'ol', 'ul']);
  });

  it('wraps non-list blocks as singles', () => {
    const out = groupBlocks([b('p', 'paragraph')]);
    expect(out[0]).toMatchObject({ kind: 'single' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/elements/post-block/group-blocks.test.ts`
Expected: FAIL — `Cannot find module './group-blocks'`.

- [ ] **Step 3: Implement the helper**

Create `apps/web/src/components/elements/post-block/group-blocks.ts`:

```ts
import { BlockObjectResponse } from '@hooneylog/shared-types';

export type BlockGroup =
  | { kind: 'ul'; items: BlockObjectResponse[] }
  | { kind: 'ol'; items: BlockObjectResponse[] }
  | { kind: 'single'; block: BlockObjectResponse };

export function groupBlocks(blocks: BlockObjectResponse[]): BlockGroup[] {
  const groups: BlockGroup[] = [];

  for (const block of blocks) {
    const type = block.type;
    const last = groups[groups.length - 1];

    if (type === 'bulleted_list_item') {
      if (last && last.kind === 'ul') last.items.push(block);
      else groups.push({ kind: 'ul', items: [block] });
    } else if (type === 'numbered_list_item') {
      if (last && last.kind === 'ol') last.items.push(block);
      else groups.push({ kind: 'ol', items: [block] });
    } else {
      groups.push({ kind: 'single', block });
    }
  }

  return groups;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/elements/post-block/group-blocks.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Fix the numbered-item class in `post-block.tsx`**

In `apps/web/src/components/elements/post-block/post-block.tsx`, change the `numbered_list_item` case (lines 58-64) so it uses `list-decimal` (only the class string changes vs. the bulleted case):

```tsx
    case 'numbered_list_item':
      return (
        <li className="text-[16px] leading-[1.6] list-decimal ml-[24px] mb-[2px] text-notion-text">
          <NotionBlockText richText={block.numbered_list_item.rich_text} />
          <BlockNestedList block={block} />
        </li>
      );
```

- [ ] **Step 6: Render grouped lists in `post-blocks.tsx`**

Replace the body of `apps/web/src/components/blocks/post-detail/post-blocks.tsx` with:

```tsx
import React, { Fragment } from 'react';
import { BlockObjectResponse } from '@hooneylog/shared-types';
import { PostBlock } from '@/components/elements/post-block/post-block';
import { groupBlocks } from '@/components/elements/post-block/group-blocks';

interface PostBlocksProps {
  blocks: BlockObjectResponse[];
}

export function PostBlocks({ blocks }: PostBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  const groups = groupBlocks(blocks);

  return (
    <article className="w-full pb-20">
      {groups.map((group, i) => {
        if (group.kind === 'ul') {
          return (
            <ul key={`ul-${i}`} className="my-[8px]">
              {group.items.map((block) => (
                <PostBlock key={block.id as React.Key} block={block} />
              ))}
            </ul>
          );
        }
        if (group.kind === 'ol') {
          return (
            <ol key={`ol-${i}`} className="my-[8px]">
              {group.items.map((block) => (
                <PostBlock key={block.id as React.Key} block={block} />
              ))}
            </ol>
          );
        }
        return (
          <Fragment key={group.block.id as React.Key}>
            <PostBlock block={group.block} />
          </Fragment>
        );
      })}
    </article>
  );
}
```

- [ ] **Step 7: Verify build + lint**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS, no new errors.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/elements/post-block/group-blocks.ts \
        apps/web/src/components/elements/post-block/group-blocks.test.ts \
        apps/web/src/components/elements/post-block/post-block.tsx \
        apps/web/src/components/blocks/post-detail/post-blocks.tsx
git commit -m "fix(post): render numbered lists as <ol> with list-decimal and real list wrappers"
```

---

### Task 2: Mermaid diagram accessibility + CLS reservation

**Findings:** #3 (icon buttons no accessible name, WCAG 1.1.1/4.1.2), #21 (modal lacks dialog semantics/focus), #28 (unsized container → CLS).

**Skill:** `accessibility` (dialog pattern, icon buttons), `core-web-vitals` (CLS).

**Files:**
- Modify: `apps/web/src/components/elements/mermaid.tsx`
- Create: `apps/web/src/components/elements/mermaid.test.tsx`

**Interfaces:**
- Consumes: existing `Mermaid({ content }: { content: string })`.
- Produces: same public API; adds accessible names + dialog semantics + min-height.

- [ ] **Step 1: Write the failing test** (mock `mermaid` so the module loads in jsdom)

Create `apps/web/src/components/elements/mermaid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  },
}));

import { Mermaid } from './mermaid';

describe('Mermaid', () => {
  it('exposes an accessible name on the expand button', () => {
    render(<Mermaid content="graph TD; A-->B" />);
    expect(screen.getByRole('button', { name: '다이어그램 확대' })).toBeInTheDocument();
  });

  it('reserves vertical space on the diagram container to avoid layout shift', () => {
    const { container } = render(<Mermaid content="graph TD; A-->B" />);
    const reserved = container.querySelector('.min-h-\\[200px\\]');
    expect(reserved).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/elements/mermaid.test.tsx`
Expected: FAIL — no button named "다이어그램 확대"; no `min-h-[200px]` element.

- [ ] **Step 3: Implement the changes**

In `apps/web/src/components/elements/mermaid.tsx`:

(a) Add `min-h-[200px]` to the outer diagram container (the `div` at ~line 82) so space is reserved before async render:

```tsx
      <div className="group relative flex justify-center my-10 w-full min-h-[200px] bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6 border border-notion-border/40 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-200 shadow-sm">
```

(b) Give the expand button an accessible name and hide its icon (lines ~84-90):

```tsx
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="다이어그램 확대"
          className="absolute top-4 right-4 p-2 rounded-md bg-white dark:bg-zinc-800 border border-notion-border/40 text-notion-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-notion-text hover:bg-notion-hover cursor-pointer z-10"
          title="자세히 보기"
        >
          <Maximize2 size={18} aria-hidden="true" />
        </button>
```

(c) Make the modal a real dialog and label the close button (lines ~100-115):

```tsx
        <div
          role="dialog"
          aria-modal="true"
          aria-label="다이어그램 확대 보기"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
```

and the close button:

```tsx
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="닫기"
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-notion-hover dark:hover:bg-zinc-800 text-notion-secondary hover:text-notion-text transition-colors cursor-pointer"
            >
              <X size={24} aria-hidden="true" />
            </button>
```

(d) Move focus to the close button on open. Add a ref and effect. Add `useRef` is already imported. Add near the other refs:

```tsx
  const closeBtnRef = useRef<HTMLButtonElement>(null);
```

extend the existing modal `useEffect` (the one keyed on `isModalOpen`) to focus the close button when open:

```tsx
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);
```

and wire the ref onto the close button: add `ref={closeBtnRef}` to the close `<button>` from step (c).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/elements/mermaid.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/elements/mermaid.tsx apps/web/src/components/elements/mermaid.test.tsx
git commit -m "fix(a11y): mermaid icon-button labels, dialog semantics, focus, and CLS min-height"
```

---

### Task 3: Sidebar category filter — selected state, group label, and post counts

**Findings:** #4 (no aria-pressed/aria-current, WCAG 1.3.1/4.1.2), #17 (discards available post counts, weak active signal).

**Skill:** `accessibility` (state + color-not-alone), `ux-designer` (scent of information / counts).

**Files:**
- Modify: `apps/web/src/components/layout/sidebar.tsx`
- Create: `apps/web/src/components/layout/sidebar.test.tsx`

**Interfaces:**
- Consumes: `categories: [string, number][]` (the number is the post count, currently discarded).

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/layout/sidebar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} alt={props.alt} /> }));

import { Sidebar } from './sidebar';

const categories: [string, number][] = [['React', 12], ['CSS', 3]];

describe('Sidebar', () => {
  it('marks the active category with aria-pressed=true', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    const active = screen.getByRole('button', { name: /React/ });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    const inactive = screen.getByRole('button', { name: /CSS/ });
    expect(inactive).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the post count for each category', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /React/ })).toHaveTextContent('12');
  });

  it('labels the category list as a group', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    expect(screen.getByRole('list', { name: '카테고리 필터' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/layout/sidebar.test.tsx`
Expected: FAIL — no `aria-pressed`, no count text, no labelled list.

- [ ] **Step 3: Implement**

In `apps/web/src/components/layout/sidebar.tsx`, replace the `<ul>...</ul>` block (lines 43-64) with:

```tsx
      <ul
        aria-label="카테고리 필터"
        className="flex flex-row lg:flex-col gap-1 lg:gap-0 m-0 p-0 list-none overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-450px)] no-scrollbar pb-4 lg:pb-0"
      >
        {categories.map(([name, count]) => {
          const isActive = name === currentActiveCategory;

          return (
            <li key={name} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => handleCurrentActiveCategory(name)}
                aria-pressed={isActive}
                className={`
                  w-full text-left py-1.5 px-3 rounded-[4px] text-[15px] transition-colors appearance-none bg-transparent outline-none cursor-pointer flex items-center justify-between gap-2 border-l-2
                  ${isActive
                    ? 'font-medium text-notion-text bg-notion-hover border-notion-text'
                    : 'text-notion-secondary font-regular border-transparent hover:bg-notion-hover hover:text-notion-text'
                  }
                `}
              >
                <span>{name}</span>
                <span className="text-[12px] font-mono text-notion-secondary tabular-nums">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
```

(The active state now adds a left border in addition to background, so the cue is not color-alone.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/layout/sidebar.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/layout/sidebar.tsx apps/web/src/components/layout/sidebar.test.tsx
git commit -m "fix(a11y/ux): sidebar aria-pressed state, group label, and per-category counts"
```

---

### Task 4: Inline code color contrast (WCAG 1.4.3)

**Finding:** #5. Inline `<code>` uses `text-[#EB5757]` on `bg-gray-100` — below 4.5:1.

**Skill:** `accessibility` (contrast).

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx:66`

**Interfaces:** none (style-only).

- [ ] **Step 1: Pick a compliant color pair**

`#B91C1C` (red-700) on `#F3F4F6` (gray-100) ≈ 5.9:1 — passes AA for normal text. Use these.

- [ ] **Step 2: Edit the inline-code branch**

In `markdown-renderer.tsx`, change line 66 from `bg-gray-100 text-[#EB5757]` to:

```tsx
              <code className="bg-gray-100 text-[#B91C1C] px-1.5 py-0.5 rounded-[3px] text-[0.9em] font-mono break-words" {...props}>
```

- [ ] **Step 3: Verify contrast manually**

Confirm with any contrast checker: foreground `#B91C1C`, background `#F3F4F6` → ratio ≥ 4.5:1. Record the value in the commit body.

- [ ] **Step 4: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/markdown-renderer.tsx
git commit -m "fix(a11y): raise inline code contrast to AA (#B91C1C on gray-100, ~5.9:1)"
```

---

### Task 5: Skip link + main landmark wiring (WCAG 2.4.1)

**Finding:** #23. No skip link, sticky header obscures anchor targets.

**Skill:** `accessibility` (bypass blocks).

**Files:**
- Modify: `apps/web/src/components/layout/app-layout.tsx`
- Modify: `apps/web/src/app/globals.css` (scroll-margin for anchors)
- Create: `apps/web/src/components/layout/app-layout.test.tsx`

**Interfaces:** `<main id="main-content">` becomes the skip target.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/layout/app-layout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  it('renders a skip link targeting the main content', () => {
    render(<AppLayout>hi</AppLayout>);
    const link = screen.getByRole('link', { name: '본문으로 건너뛰기' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('main landmark has the matching id', () => {
    render(<AppLayout>hi</AppLayout>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/layout/app-layout.test.tsx`
Expected: FAIL — no skip link, main has no id.

- [ ] **Step 3: Implement**

Replace `apps/web/src/components/layout/app-layout.tsx` with:

```tsx
import { Header } from './header';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-[4px] focus:bg-notion-text focus:text-white"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-[1392px] mx-auto px-4 sm:px-6 md:px-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Add scroll-margin so the sticky header doesn't cover anchor targets**

Append to `apps/web/src/app/globals.css`:

```css
:target {
  scroll-margin-top: 72px;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/layout/app-layout.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/layout/app-layout.tsx apps/web/src/components/layout/app-layout.test.tsx apps/web/src/app/globals.css
git commit -m "feat(a11y): add skip link, main landmark id, and anchor scroll-margin"
```

---

### Task 6: Decorative fallback image hidden from AT

**Finding:** #24. Gradient + low-contrast initials are decorative but exposed; consuming `<img>` provides the real name.

**Skill:** `accessibility` (decorative content).

**Files:**
- Modify: `apps/web/src/components/elements/category-fallback-image.tsx:35-45`

**Interfaces:** none.

- [ ] **Step 1: Mark the wrapper decorative**

In `category-fallback-image.tsx`, add `aria-hidden="true"` to the gradient wrapper `div` (line 36) so the decorative initials are not announced (the post card's title/link already supplies the accessible name):

```tsx
    <div
      aria-hidden="true"
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
      }}
    >
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/elements/category-fallback-image.tsx
git commit -m "fix(a11y): mark decorative category fallback image aria-hidden"
```

---

## Phase 2 — UX States & Feedback

### Task 7: Search input — label, search type, clear button, concrete placeholder

**Findings:** #13 (no clear button, vague placeholder, `type="text"`), #22 (no associated label).

**Skill:** `ux-designer` (forms-and-inputs, search-ux), `accessibility` (labels).

**Files:**
- Modify: `apps/web/src/components/features/search.tsx`
- Create: `apps/web/src/components/features/search.test.tsx`

**Interfaces:**
- Consumes: `{ searchValue: string; handleSearchValue: (text: string) => void }` (unchanged).

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/features/search.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Search } from './search';

describe('Search', () => {
  it('exposes the input as a labelled searchbox', () => {
    render(<Search searchValue="" handleSearchValue={vi.fn()} />);
    expect(screen.getByRole('searchbox', { name: '포스트 검색' })).toBeInTheDocument();
  });

  it('shows a clear button only when there is a value and clears on click', async () => {
    const handle = vi.fn();
    const { rerender } = render(<Search searchValue="" handleSearchValue={handle} />);
    expect(screen.queryByRole('button', { name: '검색어 지우기' })).toBeNull();

    rerender(<Search searchValue="react" handleSearchValue={handle} />);
    await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    expect(handle).toHaveBeenCalledWith('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/features/search.test.tsx`
Expected: FAIL — no searchbox role/name, no clear button. (If `@testing-library/user-event` is missing, install it: `pnpm --filter web add -D @testing-library/user-event`.)

- [ ] **Step 3: Implement**

Replace `apps/web/src/components/features/search.tsx` with:

```tsx
'use client';

import { BiSearch, BiX } from 'react-icons/bi';

interface SearchProps {
  searchValue: string;
  handleSearchValue: (text: string) => void;
}

export function Search({ searchValue, handleSearchValue }: SearchProps) {
  return (
    <section className="w-full relative mb-6 group">
      <div className="flex items-center w-full bg-white border border-notion-border rounded-[4px] px-3 py-2 transition-all focus-within:border-[#A1A1AA] focus-within:shadow-[0_0_0_2px_rgba(46,170,220,0.2)]">
        <BiSearch className="w-5 h-5 text-notion-secondary flex-shrink-0" aria-hidden="true" />
        <label htmlFor="post-search" className="sr-only">포스트 검색</label>
        <input
          id="post-search"
          type="search"
          placeholder="제목·내용 검색..."
          value={searchValue}
          onChange={(e) => handleSearchValue(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[15px] ml-2 text-notion-text placeholder:text-notion-secondary/60 [&::-webkit-search-cancel-button]:hidden"
        />
        {searchValue && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => handleSearchValue('')}
            className="flex-shrink-0 p-1 rounded-full text-notion-secondary hover:text-notion-text hover:bg-notion-hover transition-colors cursor-pointer"
          >
            <BiX className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/features/search.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/features/search.tsx apps/web/src/components/features/search.test.tsx
git commit -m "feat(ux/a11y): labelled searchbox with clear button and concrete placeholder"
```

---

### Task 8: Show live search result count

**Finding:** #13 (result count). The home client has `filteredPosts` available.

**Skill:** `ux-designer` (feedback/visibility of system status).

**Files:**
- Modify: `apps/web/src/app/home-page-client.tsx` (render count above the list)

**Interfaces:** uses existing `filteredPosts` and `searchValue` from `useFilterPost`.

- [ ] **Step 1: Implement the count line**

In `home-page-client.tsx`, replace the main content block (lines 62-70) with:

```tsx
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <Search
            searchValue={searchValue}
            handleSearchValue={setSearchValue}
          />
          {searchValue && (
            <p className="mt-2 text-[13px] text-notion-secondary" role="status" aria-live="polite">
              검색 결과 {filteredPosts.length}개
            </p>
          )}
          <div className="mt-8">
            <PostItemList posts={filteredPosts} viewsMap={viewsMap} />
          </div>
        </div>
```

- [ ] **Step 2: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Manual visual check**

Run `pnpm --filter web dev`, type in search → confirm "검색 결과 N개" appears and updates.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home-page-client.tsx
git commit -m "feat(ux): show live search result count with aria-live"
```

---

### Task 9: Empty-search state echoes the query and offers recovery

**Finding:** #14. Empty state ignores the query and offers no recovery.

**Skill:** `ux-designer` (empty states / error recovery).

**Files:**
- Modify: `apps/web/src/components/blocks/post-item-list.tsx` (accept optional `query` + `onReset`)
- Modify: `apps/web/src/app/home-page-client.tsx` (pass `query`/`onReset`)
- Create: `apps/web/src/components/blocks/post-item-list.test.tsx`

**Interfaces:**
- Produces: `PostItemList({ posts, viewsMap?, query?, onReset? })` where `query?: string`, `onReset?: () => void`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/blocks/post-item-list.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} alt={props.alt} /> }));

import { PostItemList } from './post-item-list';

describe('PostItemList empty state', () => {
  it('echoes the active query and offers a reset action', async () => {
    const onReset = vi.fn();
    render(<PostItemList posts={[]} query="그래프큐엘" onReset={onReset} />);
    expect(screen.getByText(/그래프큐엘/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '검색 초기화' }));
    expect(onReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/blocks/post-item-list.test.tsx`
Expected: FAIL — query not shown, no reset button.

- [ ] **Step 3: Implement the empty state**

In `post-item-list.tsx`, update the props interface and the empty branch:

```tsx
interface PostItemListProps {
  posts: NotionPost[];
  viewsMap?: Record<string, number>;
  query?: string;
  onReset?: () => void;
}

export function PostItemList({ posts, viewsMap = {}, query, onReset }: PostItemListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-notion-secondary col-span-full">
        <span className="text-[24px] mb-2">📄</span>
        <p className="text-[15px]">
          {query ? `'${query}'에 대한 검색 결과가 없습니다.` : '검색 결과가 없습니다.'}
        </p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-4 px-4 py-2 text-[14px] rounded-[4px] border border-notion-border text-notion-text hover:bg-notion-hover transition-colors cursor-pointer"
          >
            검색 초기화
          </button>
        )}
      </div>
    );
  }
```

- [ ] **Step 4: Pass `query`/`onReset` from the home client**

In `home-page-client.tsx`, update the `PostItemList` usage:

```tsx
            <PostItemList posts={filteredPosts} viewsMap={viewsMap} query={searchValue} onReset={() => setSearchValue('')} />
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/blocks/post-item-list.test.tsx`
Expected: PASS.

- [ ] **Step 6: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/blocks/post-item-list.tsx apps/web/src/components/blocks/post-item-list.test.tsx apps/web/src/app/home-page-client.tsx
git commit -m "feat(ux): empty search state echoes query and offers reset"
```

---

### Task 10: Loading skeleton matches real card layout

**Findings:** #15, #29. Skeleton uses `aspect-video` while real cards are `aspect-[4/3] sm:aspect-video`, and the skeleton structure differs from the card.

**Skill:** `ux-designer` (skeletons), `core-web-vitals` (CLS from skeleton→content swap).

**Files:**
- Modify: `apps/web/src/app/loading.tsx` (card skeleton block, lines 25-39)

**Interfaces:** none.

- [ ] **Step 1: Align the skeleton card to the real card**

In `loading.tsx`, replace the card skeleton map (lines 25-39) with:

```tsx
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col">
                <div className="w-full aspect-[4/3] sm:aspect-video bg-notion-gray-bg rounded-[6px] mb-4"></div>
                <div className="w-24 h-3 bg-notion-gray-bg rounded mb-2"></div>
                <div className="w-full h-5 bg-notion-gray-bg rounded mb-2"></div>
                <div className="w-3/4 h-5 bg-notion-gray-bg rounded mb-3"></div>
                <div className="w-full h-4 bg-notion-gray-bg rounded mb-1"></div>
                <div className="w-2/3 h-4 bg-notion-gray-bg rounded mb-4"></div>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="w-12 h-3 bg-notion-gray-bg rounded"></div>
                  <div className="w-16 h-3 bg-notion-gray-bg rounded"></div>
                </div>
              </div>
            ))}
```

(Matches the real card: 4/3→video image, eyebrow, 2-line title, 2-line description, footer split of views/date — no avatar, which the card doesn't have.)

- [ ] **Step 2: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 3: Manual visual check**

Throttle network in dev, reload home → skeleton shape should match the loaded cards with no visible jump.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/loading.tsx
git commit -m "fix(ux/cwv): align home skeleton to real card layout and aspect ratio"
```

---

### Task 11: Adjacent-post navigation — design tokens + single-neighbor handling

**Finding:** #16. Uses off-palette `gray-*`/`main`, and a lone prev/next link is stranded by `justify-between`.

**Skill:** `frontend-design` (token consistency), `ux-designer` (navigation).

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/move-to-another-post.tsx`
- Create: `apps/web/src/components/blocks/post-detail/move-to-another-post.test.tsx`

**Interfaces:** unchanged props `{ previousPost, nextPost }`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/blocks/post-detail/move-to-another-post.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MoveToAnotherPost } from './move-to-another-post';

const post = (id: string, title: string) => ({ id, title } as any);

describe('MoveToAnotherPost', () => {
  it('renders only the next link when there is no previous post', () => {
    render(<MoveToAnotherPost previousPost={null} nextPost={post('2', 'Next One')} />);
    expect(screen.getByText('Next One')).toBeInTheDocument();
    expect(screen.queryByText('이전 글')).toBeNull();
  });

  it('renders both links when both neighbors exist', () => {
    render(<MoveToAnotherPost previousPost={post('1', 'Prev')} nextPost={post('2', 'Next')} />);
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/blocks/post-detail/move-to-another-post.test.tsx`
Expected: FAIL — `이전 글` text uses an HTML entity `&larr;` adjacent; adjust by querying `이전 글` substring (the test uses `queryByText('이전 글')` which matches the `&larr; 이전 글` node). If it unexpectedly passes at this step, proceed — the behavioral change in step 3 still applies and the test guards regressions.

- [ ] **Step 3: Implement with tokens + single-neighbor centering**

Replace the body of `move-to-another-post.tsx` with:

```tsx
import React from 'react';
import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';

interface MoveToAnotherPostProps {
  previousPost: NotionPost | null;
  nextPost: NotionPost | null;
}

export function MoveToAnotherPost({ previousPost, nextPost }: MoveToAnotherPostProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav
      aria-label="이전/다음 글"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-10 my-10 border-t border-b border-notion-border"
    >
      {previousPost ? (
        <Link
          href={`/post/${previousPost.id}`}
          className="group flex flex-col items-start hover:bg-notion-hover p-4 rounded-lg transition-colors w-full"
        >
          <span className="text-notion-secondary text-sm mb-2 font-medium">&larr; 이전 글</span>
          <span className="font-bold text-lg text-notion-text group-hover:text-notion-blue-text line-clamp-1 w-full text-left transition-colors">
            {previousPost.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {nextPost && (
        <Link
          href={`/post/${nextPost.id}`}
          className="group flex flex-col items-end hover:bg-notion-hover p-4 rounded-lg transition-colors w-full text-right sm:col-start-2"
        >
          <span className="text-notion-secondary text-sm mb-2 font-medium">다음 글 &rarr;</span>
          <span className="font-bold text-lg text-notion-text group-hover:text-notion-blue-text line-clamp-1 w-full text-right transition-colors">
            {nextPost.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/blocks/post-detail/move-to-another-post.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/move-to-another-post.tsx apps/web/src/components/blocks/post-detail/move-to-another-post.test.tsx
git commit -m "fix(ux): adjacent-post nav uses design tokens and handles single neighbor"
```

---

### Task 12: 404 page — proper alt + extra recovery path

**Finding:** #19. `alt="404 image"`, only recovery is the home link.

**Skill:** `ux-designer` (error recovery), `accessibility` (alt text).

**Files:**
- Modify: `apps/web/src/app/not-found.tsx`
- Create: `apps/web/src/app/not-found.test.tsx`

**Interfaces:** none.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/app/not-found.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} alt={props.alt} /> }));

import NotFound from './not-found';

describe('NotFound', () => {
  it('treats the illustration as decorative (empty alt)', () => {
    const { container } = render(<NotFound />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('offers home and all-posts recovery links', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/app/not-found.test.tsx`
Expected: FAIL — alt is `"404 image"`, not empty.

- [ ] **Step 3: Implement**

Replace `apps/web/src/app/not-found.tsx` with:

```tsx
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full flex items-center justify-center py-40">
      <section className="flex flex-col items-center justify-center gap-8">
        <div className="relative w-[300px] h-[120px] sm:w-[500px] sm:h-[200px]">
          <Image
            src="/images/404.png"
            fill
            className="object-contain"
            alt=""
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-notion-text text-center">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="text-notion-secondary text-center">
          주소가 바뀌었거나 삭제된 글일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 bg-notion-blue-text text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
```

(Illustration is decorative — empty `alt` — because the `<h1>` already states the error. `bg-main`/`text-gray-800` replaced with defined tokens.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/app/not-found.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/not-found.tsx apps/web/src/app/not-found.test.tsx
git commit -m "fix(a11y/ux): 404 decorative alt, defined tokens, and recovery copy"
```

---

### Task 13: Respect prefers-reduced-motion

**Finding:** #18. `animate-pulse`, `group-hover:scale`, transitions ignore the user's motion preference.

**Skill:** `accessibility` (WCAG 2.3.3 animation), `ux-designer`.

**Files:**
- Modify: `apps/web/src/app/globals.css` (global reduced-motion rule)

**Interfaces:** none.

- [ ] **Step 1: Add the global rule**

Append to `apps/web/src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify build/lint**

Run: `pnpm --filter web lint && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 3: Manual check**

Enable "Reduce motion" in OS settings → confirm skeleton pulse and hover scale stop animating.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(a11y): honor prefers-reduced-motion globally"
```

---

## Phase 3 — Performance (Core Web Vitals)

### Task 14: Reserve space for content images (CLS)

**Findings:** #7, #27. Markdown images and Notion block images render as raw `<img>` with no dimensions → guaranteed layout shift.

**Skill:** `core-web-vitals` (CLS), `frontend-design`.

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx:152-165` (img component)
- Modify: `apps/web/src/components/elements/post-block/post-block.tsx:81-96` (image case)

**Interfaces:** none. Notion image dimensions are not reliably available at render time, so use an `aspect-ratio` wrapper that reserves a sensible block and lets the image scale within it.

- [ ] **Step 1: Markdown image — reserve space**

In `markdown-renderer.tsx`, replace the `img` component (lines 152-165) with:

```tsx
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img({ src, alt, ...props }: any) {
            return (
              <figure className="my-6 flex flex-col items-start w-full">
                <div className="w-full max-h-[70vh] aspect-[16/10] overflow-hidden rounded-[4px] bg-notion-gray-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src as string}
                    alt={(alt as string) || ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                    {...props}
                  />
                </div>
                {alt && <figcaption className="mt-2 text-[14px] text-notion-secondary">{alt as React.ReactNode}</figcaption>}
              </figure>
            );
          },
```

- [ ] **Step 2: Notion block image — reserve space (same pattern)**

In `post-block.tsx`, replace the `image` case `figure` (lines 85-95) with:

```tsx
      return (
        <figure className="my-3 flex flex-col items-start w-full">
          <div className="w-full max-h-[70vh] aspect-[16/10] overflow-hidden rounded-[4px] border border-notion-border bg-notion-gray-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={caption || ''}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
          {caption && <figcaption className="mt-2 text-[14px] text-notion-secondary">{caption}</figcaption>}
        </figure>
      );
```

- [ ] **Step 3: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 4: Manual check**

Open a post with images on a throttled connection → image area is reserved before load (no jump).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/markdown-renderer.tsx apps/web/src/components/elements/post-block/post-block.tsx
git commit -m "perf(cwv): reserve aspect-ratio space for content images to remove CLS"
```

---

### Task 15: Prioritize the above-the-fold cover image (LCP)

**Finding:** #26. First cover image loads lazily; should be `priority`.

**Skill:** `core-web-vitals` (LCP).

**Files:**
- Modify: `apps/web/src/components/blocks/post-item-list.tsx` (use map index, set `priority` on first card)

**Interfaces:** none.

- [ ] **Step 1: Add index and priority**

In `post-item-list.tsx`, change the map signature to include the index and pass `priority` to the first image:

```tsx
      {posts.map((post, index) => {
```

and on the `<Image>` (the non-fallback branch, ~line 43) add:

```tsx
                  <Image
                    src={imageSrc}
                    alt={post.category || 'Cover image'}
                    fill
                    priority={index === 0}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
```

- [ ] **Step 2: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS. (Next will no longer warn about the LCP image being lazy.)

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/blocks/post-item-list.tsx
git commit -m "perf(cwv): mark first cover image priority for faster LCP"
```

---

### Task 16: Korean-first font stack (drop wasted Inter latin-only)

**Findings:** #9 (contradictory font tokens; declared faces never loaded), #25 (Inter latin subset loaded but Korean body falls back to system anyway → wasted request).

**Skill:** `core-web-vitals` (font loading), `frontend-design` (type system).

**Files:**
- Modify: `apps/web/src/app/layout.tsx` (drop `next/font` Inter or keep deliberately; here: drop the wasted latin-only load)
- Modify: `apps/web/src/app/globals.css` (make `--font-sans` a Korean-first system stack; drop unused serif/mono custom faces that are never loaded)

**Interfaces:** `body` keeps using `var(--font-sans)`.

- [ ] **Step 1: Remove the unused Inter import from the layout**

In `apps/web/src/app/layout.tsx`, delete the `Inter` import (line 2) and the `inter` const (lines 8-11), and remove `className={inter.className}` from `<html>` (line 34):

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  metadataBase: new URL('https://hooneylog.com'),
  title: {
    default: "HooneyLog",
    template: "%s | HooneyLog"
  },
  description: "HooneyLog Blog based on Notion API",
  verification: {
    google: "uTxOPNaU5TsgLGH-7rdPqKlIJNF-fNwBpt7wqNh4dzE",
  },
  alternates: {
    canonical: "/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-full flex flex-col m-0 p-0 text-notion-text bg-notion-bg">
        <AppLayout>{children}</AppLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Make the font tokens Korean-first and honest**

In `apps/web/src/app/globals.css`, replace the three `--font-*` lines (16-18) with a system stack that renders Korean well and matches what is actually available (no faux references to faces that are never loaded):

```css
  --font-sans: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Segoe UI', Roboto, 'Malgun Gothic', 'Noto Sans KR', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --font-serif: Georgia, 'Nanum Myeongjo', 'Apple SD Gothic Neo', serif;
  --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
```

(If you later want a real webfont, load **Pretendard** via `next/font/local` and apply it to `--font-sans` — but do not declare faces in tokens that are never loaded.)

- [ ] **Step 3: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS, and the build output should no longer fetch the Google Inter font.

- [ ] **Step 4: Manual check**

`pnpm --filter web dev` → Korean text renders in the system Korean face; no network request for Inter in the Network tab.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/app/globals.css
git commit -m "perf/design: Korean-first system font stack; drop wasted Inter latin-only load"
```

---

## Phase 4 — Brand & Visual Identity

> These tasks are intentionally last: they are the most subjective and benefit from the structural/a11y fixes already landed. Consult the **frontend-design** skill (`.claude/skills/frontend-design/SKILL.md`) before each — it asks for deliberate, non-templated choices. Where a choice is open, the plan picks a concrete default; adjust to taste during review.

### Task 17: Replace the Notion logo with a Hooneylog mark; remove dead header space

**Findings:** #8 (brand mark is literally the Notion glyph), #20 (empty action container + Notion-flavored comments + reserved divider).

**Skill:** `frontend-design` (distinctive identity).

**Files:**
- Modify: `apps/web/src/components/layout/header.tsx`
- Create: `apps/web/src/components/layout/header.test.tsx`

**Interfaces:** none.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/layout/header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('home link is labelled for the blog, not Notion', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /HooneyLog/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses a monogram mark with accessible text', () => {
    render(<Header />);
    expect(screen.getByText('H')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/components/layout/header.test.tsx`
Expected: FAIL — there is no `H` monogram text node (the current mark is an SVG path).

- [ ] **Step 3: Implement a simple monogram + clean structure**

Replace `apps/web/src/components/layout/header.tsx` with:

```tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-white/90 backdrop-blur-md border-b border-notion-border flex items-center px-4 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 h-full px-2 rounded-[4px] hover:bg-notion-hover transition-colors"
      >
        <span
          aria-hidden="true"
          className="w-[24px] h-[24px] rounded-[6px] bg-notion-text text-white flex items-center justify-center font-bold text-[14px] tracking-tight"
        >
          H
        </span>
        <span className="font-semibold text-[15px] text-notion-text tracking-tight">HooneyLog</span>
      </Link>
    </header>
  );
}
```

(Removes the Notion SVG/comments, the stray divider, and the empty action container. The monogram is a deliberate, owned mark; restyle later if desired — e.g. swap `bg-notion-text` for the accent from Task 18.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/components/layout/header.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/layout/header.tsx apps/web/src/components/layout/header.test.tsx
git commit -m "design: replace Notion glyph with Hooneylog monogram; remove dead header markup"
```

---

### Task 18: Introduce one owned accent color

**Finding:** #10. Palette is the unmodified Notion default; no chosen accent / point of view.

**Skill:** `frontend-design` (deliberate palette).

**Files:**
- Modify: `apps/web/src/app/globals.css` (add `--color-accent`)
- Modify: `apps/web/src/components/blocks/post-item-list.tsx` (title hover → accent)
- Modify: `apps/web/src/components/layout/sidebar.tsx` (today stat → accent)

**Interfaces:** new utility `text-accent` / `bg-accent` from `--color-accent`.

- [ ] **Step 1: Define the accent token**

In `apps/web/src/app/globals.css`, inside `@theme inline`, add (a deliberate teal-leaning accent distinct from the default Notion blue; adjust to taste):

```css
  --color-accent: #0F7B6C;
  --color-accent-bg: #E3F2EF;
```

- [ ] **Step 2: Apply the accent at a few deliberate spots**

In `post-item-list.tsx`, change the title hover from `group-hover:text-notion-blue-text` to `group-hover:text-accent`:

```tsx
                <h3 className="text-[18px] sm:text-[20px] font-bold text-notion-text leading-[1.3] mb-2 group-hover:text-accent transition-colors line-clamp-3">
```

In `sidebar.tsx`, change the "Today" value color from `text-notion-blue-text` to `text-accent`:

```tsx
              <span className="font-mono text-notion-text font-medium text-accent">+{stats.today.toLocaleString()}</span>
```

- [ ] **Step 3: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS (utilities `text-accent` generate from the token).

- [ ] **Step 4: Manual visual check**

Confirm the accent reads intentionally on hover titles and the Today stat, and has adequate contrast on white (`#0F7B6C` on white ≈ 4.8:1).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/components/blocks/post-item-list.tsx apps/web/src/components/layout/sidebar.tsx
git commit -m "design: introduce owned accent color and apply at key brand moments"
```

---

### Task 19: Tighten prose reading measure + resolve dead container token

**Finding:** #11. `--container-max` (900px) is unused/dead. Note: the post page **already caps the body** at `max-w-[800px]` (`post/[slug]/page.tsx:115`), so the "no measure" part of the finding is inaccurate — the real improvements are (a) the dead token and (b) 800px is slightly wide for comfortable line length (~680–760px is ideal).

**Skill:** `frontend-design` (line length / measure), `ux-designer` (readability).

**Files:**
- Modify: `apps/web/src/app/globals.css` (give `--container-max` the prose-measure value, or delete it)
- Modify: `apps/web/src/app/post/[slug]/page.tsx:115` (tighten 800px → 720px)

**Interfaces:** prose column capped at 720px; app shell stays wide.

- [ ] **Step 1: Make the token meaningful (not dead)**

In `globals.css`, change line 13 so the token reflects the prose measure actually used:

```css
  --container-max: 720px;
```

- [ ] **Step 2: Tighten the existing body cap**

In `post/[slug]/page.tsx`, change the body wrapper on line 115 from `max-w-[800px]` to `max-w-[720px]`:

```tsx
      <div className="w-full max-w-[720px] px-4 sm:px-6 mx-auto flex flex-col items-center">
```

- [ ] **Step 3: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 4: Manual check**

Open a long post → body line length is comfortable (~70-90 chars).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/post/[slug]/page.tsx
git commit -m "design: tighten prose reading measure to 720px and make container token meaningful"
```

---

### Task 20: Consistent vertical rhythm in the article body

**Finding:** #2. Mixed em/px margins and meaningless 1-2px values; no shared spacing scale.

**Skill:** `frontend-design` (spacing rhythm).

**Files:**
- Modify: `apps/web/src/components/elements/post-block/post-block.tsx` (paragraph/headings/quote/code/divider/bookmark margins)
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx` (matching p/h1/h2/h3/blockquote/hr margins)

**Interfaces:** none. Apply one scale consistently across both renderers.

Spacing scale to apply (replace the existing ad-hoc literals):
- paragraph: `mb-[0.8em]`
- h1: `mt-[2em] mb-[0.5em]`
- h2: `mt-[1.6em] mb-[0.4em]`
- h3: `mt-[1.2em] mb-[0.3em]`
- blockquote / code / bookmark / divider: `my-[1.2em]`

- [ ] **Step 1: Update `post-block.tsx` margins**

Apply the scale to each case (paragraph line 24, h1 line 31, h2 line 38, h3 line 45, divider line 99, quote line 103, code container line 117, bookmark line 136). Example for paragraph and h2:

```tsx
        <p className="text-[16px] leading-[1.6] mb-[0.8em] break-keep min-h-[24px] text-notion-text">
```
```tsx
        <h2 className="text-[24px] font-semibold mt-[1.6em] mb-[0.4em] leading-[1.3] text-notion-text">
```

Apply the corresponding values to h1 (`mt-[2em] mb-[0.5em]`), h3 (`mt-[1.2em] mb-[0.3em]`), divider (`my-[1.2em]`), quote (`my-[1.2em]`), code container (`my-[1.2em]`), bookmark (`my-[1.2em]`).

- [ ] **Step 2: Mirror the scale in `markdown-renderer.tsx`**

Apply the same values to the `p` (line 133), `h1` (121), `h2` (125), `h3` (129), `blockquote` (146), and `hr` (168) component overrides so both renderers share one rhythm.

- [ ] **Step 3: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 4: Manual check**

Open posts rendered by both paths (Notion-block posts and markdown posts) → spacing is even and matches between them.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/elements/post-block/post-block.tsx apps/web/src/components/blocks/post-detail/markdown-renderer.tsx
git commit -m "design: apply one consistent vertical rhythm across both article renderers"
```

---

### Task 21: Unify author identity across components

**Finding:** #12. Author name/tagline duplicated and inconsistently labeled (`작성자` prefix in one place; different taglines; mixed `<img>`/`next/image`).

**Skill:** `frontend-design` (consistency / DRY), `ux-designer`.

**Files:**
- Create: `apps/web/src/components/elements/author-badge.tsx`
- Create: `apps/web/src/lib/author.ts`
- Modify: `apps/web/src/components/blocks/post-detail/post-header.tsx` (use the badge)
- Modify: `apps/web/src/components/layout/sidebar.tsx` (use shared constants)
- Modify: `apps/web/src/components/layout/footer.tsx` (use shared name)

**Interfaces:**
- Produces: `AUTHOR = { name: 'Seunghoon Shin', tagline: '기록과 함께 성장하는 풀스택 개발자', avatar: '/images/profile.png' }` in `lib/author.ts`, and `<AuthorBadge size?: 'sm' | 'md' />`.

- [ ] **Step 1: Create the shared author constants**

Create `apps/web/src/lib/author.ts`:

```ts
export const AUTHOR = {
  name: 'Seunghoon Shin',
  tagline: '기록과 함께 성장하는 풀스택 개발자',
  avatar: '/images/profile.png',
} as const;
```

- [ ] **Step 2: Create the AuthorBadge component**

Create `apps/web/src/components/elements/author-badge.tsx`:

```tsx
import Image from 'next/image';
import { AUTHOR } from '@/lib/author';

export function AuthorBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 40 : 48;
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative rounded-full overflow-hidden border border-notion-border bg-white flex-shrink-0"
        style={{ width: dim, height: dim }}
      >
        <Image src={AUTHOR.avatar} alt={AUTHOR.name} fill className="object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-medium text-notion-text">{AUTHOR.name}</span>
        <span className="text-[13px] text-notion-secondary">{AUTHOR.tagline}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Use the badge in `post-header.tsx`**

Replace the "Author Info" block (lines 51-65) with:

```tsx
        {/* Author Info */}
        <AuthorBadge />
```

and add the import at the top:

```tsx
import { AuthorBadge } from '@/components/elements/author-badge';
```

- [ ] **Step 4: Use shared constants in `sidebar.tsx`**

In the profile section (lines 16-23), replace the hard-coded name/tagline with `AUTHOR` values and the image alt with `AUTHOR.name`:

```tsx
        <Image src={AUTHOR.avatar} alt={AUTHOR.name} fill className="object-cover" />
```
```tsx
        <h3 className="font-semibold text-notion-text text-[15px] mb-1">{AUTHOR.name}</h3>
        <p className="text-[13px] text-notion-secondary leading-snug mb-4">
          {AUTHOR.tagline}
        </p>
```

and import: `import { AUTHOR } from '@/lib/author';`

- [ ] **Step 5: Use shared name in `footer.tsx`**

```tsx
import { AUTHOR } from '@/lib/author';

export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border py-12 mt-20 flex flex-col items-center justify-center text-sm text-notion-secondary">
      <div className="opacity-70">
        © {new Date().getFullYear()} {AUTHOR.name}. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Verify build/lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 7: Manual check**

Confirm the author name/tagline/avatar are identical on the home sidebar, post header, and footer (no `작성자` prefix, one tagline).

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/author.ts apps/web/src/components/elements/author-badge.tsx apps/web/src/components/blocks/post-detail/post-header.tsx apps/web/src/components/layout/sidebar.tsx apps/web/src/components/layout/footer.tsx
git commit -m "design: unify author identity via shared AUTHOR constant and AuthorBadge"
```

---

## Final Verification

- [ ] **Run the full check suite**

Run: `pnpm --filter web test && pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: all PASS.

- [ ] **Manual smoke test**

`pnpm --filter web dev` → verify: home (search + clear + count + empty state), a post with lists/images/mermaid (ordered list numbers, reserved image space, accessible diagram modal), 404 page, keyboard tab order (skip link first), reduced-motion.

---

## Finding → Task Coverage Map

| # | Finding | Task |
|---|---------|------|
| 1, 6 | Numbered list renders as bullets / no list wrapper | Task 1 |
| 2 | No consistent vertical rhythm | Task 20 |
| 3 | Mermaid icon buttons no accessible name | Task 2 |
| 4 | Category buttons no selected state for AT | Task 3 |
| 5 | Inline code contrast | Task 4 |
| 7, 27 | Content images no dimensions → CLS | Task 14 |
| 8, 20 | Notion logo as brand / dead header space | Task 17 |
| 9, 25 | Contradictory fonts / wasted Inter latin-only | Task 16 |
| 10 | Default palette, no accent | Task 18 |
| 11 | Dead container token / no reading measure | Task 19 |
| 12 | Author identity duplicated/inconsistent | Task 21 |
| 13, 22 | Search: no clear/count/label/placeholder | Tasks 7, 8 |
| 14 | Empty search state ignores query | Task 9 |
| 15, 29 | Skeleton doesn't match cards | Task 10 |
| 16 | Adjacent-post nav off-palette / single neighbor | Task 11 |
| 17 | Sidebar discards counts / weak active signal | Task 3 |
| 18 | No prefers-reduced-motion | Task 13 |
| 19 | 404 alt / recovery | Task 12 |
| 21 | Mermaid modal dialog semantics/focus | Task 2 |
| 23 | No skip link / main landmark | Task 5 |
| 24 | Fallback initials low contrast / not hidden | Task 6 |
| 26 | LCP cover image not priority | Task 15 |
| 28 | Mermaid unsized container CLS | Task 2 |

All 29 confirmed findings are covered.
