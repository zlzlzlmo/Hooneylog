# Blog Content Discovery (#2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Help readers find more posts — render tags as chips linking to dedicated tag pages, recommend related posts on the detail page, and bound the home list with a "더 보기" load-more control.

**Architecture:** Pure scoring logic (`getRelatedPosts`) lives in a testable util. Tag chips and related posts are small presentational components. A new `/tag/[tag]` route reuses `PostItemList`. Load-more is local state in the home client; `PostItemList` stays presentational.

**Tech Stack:** Next.js 16 App Router (SSG via `generateStaticParams`), React 19, TypeScript, Tailwind v4, Vitest.

## Global Constraints

- pnpm 9. One test file: `pnpm --filter web test -- <path>`. Full check: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`.
- TypeScript strict incl. `noUncheckedIndexedAccess` — guard array/regex indexing (`x[0]` is `T | undefined`); no `as any`.
- Tailwind v4 tokens only (`notion-*`, `accent`). Korean copy `습니다`/noun style.
- Types: `NotionPost = { id, category, createdAt, description, tags: ITag[], title }`, `ITag = { id, name }`. `getAllPosts(): Promise<NotionPost[]>`, `getPostById(id): Promise<NotionPost | undefined>` from `@/lib/notion`. Category sentinel `ALL = '전체'` from `@/utils/category`.
- Tag route param is `encodeURIComponent(tag.name)`; decode with `decodeURIComponent` in the page.
- `getRelatedPosts(all: NotionPost[], current: NotionPost, limit?: number): NotionPost[]`.

---

### Task 1: Related-posts scoring util

**Files:**
- Create: `apps/web/src/utils/related-posts.ts`
- Create: `apps/web/src/utils/related-posts.test.ts`

**Interfaces:**
- Produces: `getRelatedPosts(all, current, limit = 3)` — excludes `current` by id; score `+2` same category, `+1` per shared tag id; keep only score > 0; sort by score desc then `createdAt` desc; return up to `limit`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/utils/related-posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getRelatedPosts } from './related-posts';
import { NotionPost } from '@hooneylog/shared-types';

const mk = (id: string, category: string, tagNames: string[], createdAt = '2026-01-01'): NotionPost => ({
  id,
  category,
  createdAt,
  description: '',
  title: id,
  tags: tagNames.map((n) => ({ id: n, name: n })),
});

describe('getRelatedPosts', () => {
  it('excludes the current post', () => {
    const cur = mk('a', 'React', ['hooks']);
    const all = [cur, mk('b', 'React', ['hooks'])];
    expect(getRelatedPosts(all, cur).map((p) => p.id)).toEqual(['b']);
  });

  it('ranks same-category and shared-tag posts higher', () => {
    const cur = mk('a', 'React', ['hooks', 'rsc']);
    const sameCatSharedTag = mk('b', 'React', ['hooks']);   // +2 +1 = 3
    const sharedTwoTags = mk('c', 'CSS', ['hooks', 'rsc']); // +2 = 2
    const unrelated = mk('d', 'Go', ['cli']);               // 0
    const out = getRelatedPosts([cur, unrelated, sharedTwoTags, sameCatSharedTag], cur);
    expect(out.map((p) => p.id)).toEqual(['b', 'c']);
  });

  it('respects the limit', () => {
    const cur = mk('a', 'React', ['x']);
    const all = [cur, mk('b', 'React', []), mk('c', 'React', []), mk('d', 'React', [])];
    expect(getRelatedPosts(all, cur, 2)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test -- src/utils/related-posts.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `apps/web/src/utils/related-posts.ts`:

```ts
import { NotionPost } from '@hooneylog/shared-types';

export function getRelatedPosts(all: NotionPost[], current: NotionPost, limit = 3): NotionPost[] {
  const currentTagIds = new Set(current.tags.map((t) => t.id));

  return all
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 2;
      for (const tag of p.tags) {
        if (currentTagIds.has(tag.id)) score += 1;
      }
      return { post: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.createdAt.localeCompare(a.post.createdAt))
    .slice(0, limit)
    .map((entry) => entry.post);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter web test -- src/utils/related-posts.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/utils/related-posts.ts apps/web/src/utils/related-posts.test.ts
git commit -m "feat(discovery): related-posts scoring util"
```

---

### Task 2: TagList component

**Files:**
- Create: `apps/web/src/components/elements/tag-list.tsx`

**Interfaces:**
- Produces: `TagList({ tags, className }: { tags: ITag[]; className?: string })` — renders each tag as a chip linking to `/tag/${encodeURIComponent(tag.name)}`; renders nothing if `tags` is empty.

- [ ] **Step 1: Create the component**

Create `apps/web/src/components/elements/tag-list.tsx`:

```tsx
import Link from 'next/link';
import { ITag } from '@hooneylog/shared-types';

export function TagList({ tags, className = '' }: { tags: ITag[]; className?: string }) {
  if (!tags || tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 m-0 p-0 list-none ${className}`}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <Link
            href={`/tag/${encodeURIComponent(tag.name)}`}
            className="inline-block px-2.5 py-1 rounded-full text-[13px] bg-notion-gray-bg text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors no-underline"
          >
            #{tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/elements/tag-list.tsx
git commit -m "feat(discovery): TagList chip component"
```

---

### Task 3: Render tags in the post header

**Files:**
- Modify: `apps/web/src/components/blocks/post-detail/post-header.tsx`

**Interfaces:**
- Consumes: `TagList` (Task 2). `tags` is already a `PostHeader` prop.

- [ ] **Step 1: Render TagList under the author badge**

In `post-header.tsx`, add the import:

```tsx
import { TagList } from '@/components/elements/tag-list';
```

Destructure `tags` in the component params (it is declared in props but currently not destructured), and render the tag list after `<AuthorBadge />`:

```tsx
export function PostHeader({ title, category, createdAt, tags, slug, initialViews, readingMinutes }: PostHeaderProps) {
```

After `<AuthorBadge />`:

```tsx
        <TagList tags={tags} className="mt-6" />
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/post-header.tsx
git commit -m "feat(discovery): show tags in post header"
```

---

### Task 4: Related posts on the detail page (+ fix keywords bug)

**Files:**
- Create: `apps/web/src/components/blocks/post-detail/related-posts.tsx`
- Modify: `apps/web/src/app/post/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getRelatedPosts` (Task 1).
- Produces: `RelatedPosts({ posts }: { posts: NotionPost[] })` — section listing related posts; renders nothing if empty.

- [ ] **Step 1: Create the RelatedPosts component**

Create `apps/web/src/components/blocks/post-detail/related-posts.tsx`:

```tsx
import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';
import { formatDate } from '@/utils/date';

export function RelatedPosts({ posts }: { posts: NotionPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="my-12">
      <h2 id="related-heading" className="text-[18px] font-semibold text-notion-text mb-4">
        관련 글
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-0 p-0 list-none">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.id}`}
              className="group flex flex-col h-full p-4 rounded-[6px] border border-notion-border hover:bg-notion-hover transition-colors no-underline"
            >
              <span className="text-[12px] font-medium text-notion-secondary mb-1">{post.category || '미분류'}</span>
              <span className="text-[15px] font-semibold text-notion-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {post.title}
              </span>
              <span className="mt-auto pt-3 text-[12px] text-notion-secondary font-mono">{formatDate(post.createdAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Wire into the page and fix the keywords bug**

In `apps/web/src/app/post/[slug]/page.tsx`:

Add imports:

```tsx
import { RelatedPosts } from '@/components/blocks/post-detail/related-posts';
import { getRelatedPosts } from '@/utils/related-posts';
```

Fix the JSON-LD `keywords` line (tags are objects, not strings) — change:

```tsx
    keywords: post.tags.join(', '),
```

to:

```tsx
    keywords: post.tags.map((t) => t.name).join(', '),
```

Compute related posts next to the toc/readingMinutes computation:

```tsx
  const relatedPosts = getRelatedPosts(allPosts, post);
```

Render `<RelatedPosts posts={relatedPosts} />` inside the reading column, between `<MoveToAnotherPost ... />` and the `<CommentProvider>`:

```tsx
              <MoveToAnotherPost previousPost={previousPost ?? null} nextPost={nextPost ?? null} />
              <RelatedPosts posts={relatedPosts} />
              <CommentProvider>
                <GiscusComment />
              </CommentProvider>
```

- [ ] **Step 3: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/related-posts.tsx "apps/web/src/app/post/[slug]/page.tsx"
git commit -m "feat(discovery): related posts on detail page; fix JSON-LD keywords"
```

---

### Task 5: Tag listing page

**Files:**
- Create: `apps/web/src/app/tag/[tag]/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `PostItemList`.

- [ ] **Step 1: Create the tag page**

Create `apps/web/src/app/tag/[tag]/page.tsx`:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/notion';
import { PostItemList } from '@/components/blocks/post-item-list';

export const revalidate = 60;

type Params = Promise<{ tag: string }>;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const names = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) names.add(tag.name);
  }
  return Array.from(names).map((name) => ({ tag: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return {
    title: `태그: ${name}`,
    description: `'${name}' 태그가 달린 글 목록`,
    alternates: { canonical: `/tag/${tag}` },
  };
}

export default async function TagPage({ params }: { params: Params }): Promise<React.JSX.Element> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = await getAllPosts();
  const tagged = posts.filter((post) => post.tags.some((t) => t.name === name));

  return (
    <div className="w-full pt-10 pb-20">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-[15px] text-notion-secondary hover:text-notion-text hover:bg-notion-hover px-2 py-1 -ml-2 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          모든 게시글
        </Link>
      </div>
      <h1 className="text-[28px] sm:text-[32px] font-bold text-notion-text mb-8">
        <span className="text-accent">#{name}</span>
        <span className="text-notion-secondary text-[18px] font-medium ml-3">{tagged.length}개</span>
      </h1>
      <PostItemList posts={tagged} />
    </div>
  );
}
```

- [ ] **Step 2: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS; build lists `/tag/[tag]` with generated params.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/src/app/tag/[tag]/page.tsx"
git commit -m "feat(discovery): tag listing pages"
```

---

### Task 6: Load-more on the home list

**Files:**
- Modify: `apps/web/src/app/home-page-client.tsx`

**Interfaces:**
- Consumes: existing `filteredPosts`, `searchValue`, `currentActiveCategory` from `useFilterPost`.

- [ ] **Step 1: Add load-more state and control**

In `home-page-client.tsx`:

Add `useEffect` is already imported; add `PAGE_SIZE` const at module scope (top, after imports):

```tsx
const PAGE_SIZE = 12;
```

Inside the component, after the `useFilterPost(...)` destructure, add visible-count state that resets when the filter/search changes:

```tsx
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchValue, currentActiveCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = filteredPosts.length > visibleCount;
```

(`useState` is already imported in this file.)

Change the `PostItemList` usage to render `visiblePosts`, and add a "더 보기" button below it:

```tsx
          <div className="mt-8">
            <PostItemList posts={visiblePosts} viewsMap={viewsMap} query={searchValue} onReset={() => setSearchValue('')} />
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="px-5 py-2.5 text-[14px] rounded-[6px] border border-notion-border text-notion-text hover:bg-notion-hover transition-colors cursor-pointer"
                >
                  더 보기 ({filteredPosts.length - visibleCount}개 남음)
                </button>
              </div>
            )}
          </div>
```

(The empty-state still works: when `filteredPosts` is empty, `visiblePosts` is empty and `PostItemList` shows the query-aware empty state.)

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Manual check**

`pnpm --filter web dev`: home shows 12 posts + "더 보기"; clicking reveals 12 more; changing category/search resets to 12.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/home-page-client.tsx
git commit -m "feat(discovery): load-more pagination on home list"
```

---

## Final Verification

Run: `pnpm --filter web test && pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: all PASS.

## Spec Coverage Map (#2)

| Spec item | Task |
|---|---|
| Tag chips | Tasks 2, 3 |
| Tag pages (`/tag/[tag]`) | Task 5 |
| Related posts (category+tag scoring) | Tasks 1, 4 |
| Load-more (PAGE_SIZE=12, resets on filter) | Task 6 |
| Fix JSON-LD keywords bug | Task 4 |
