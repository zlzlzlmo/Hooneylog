# Blog Distribution (#4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Make posts shareable and discoverable off-site — an RSS feed, dynamic per-post Open Graph images, share buttons, a reading-progress bar, and a back-to-top button.

**Architecture:** RSS is a Route Handler. OG images use `next/og` `ImageResponse` (file-based `opengraph-image`) with a robust Korean-font fetch that degrades gracefully. Share/progress/back-to-top are small client islands mounted on the post page.

**Tech Stack:** Next.js 16 App Router (Route Handlers, file-based metadata images, `next/og` — bundled, no new dep), React 19, TypeScript, Tailwind v4, lucide-react.

## Global Constraints

- pnpm 9. Full check: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`. Tests: `pnpm --filter web test`.
- TypeScript strict (`noUncheckedIndexedAccess`); no `as any`.
- Tailwind v4 tokens (`notion-*`, `accent`). Korean copy `습니다`/noun style. New client components declare `'use client'`.
- Site origin: `https://hooneylog.com`. `getAllPosts(): Promise<NotionPost[]>`, `getPostById(id)` from `@/lib/notion`. `NotionPost = { id, category, createdAt, description, tags, title }`.
- OG generation MUST NOT break the build: the Korean-font fetch is wrapped in try/catch and the title is rendered only when the font loaded.

---

### Task 1: RSS feed

**Files:**
- Create: `apps/web/src/app/feed.xml/route.ts`
- Modify: `apps/web/src/app/layout.tsx` (advertise the feed)

**Interfaces:**
- Produces: `GET /feed.xml` returning RSS 2.0 XML.

- [ ] **Step 1: Create the route handler**

Create `apps/web/src/app/feed.xml/route.ts`:

```ts
import { getAllPosts } from '@/lib/notion';

export const revalidate = 3600;

const SITE = 'https://hooneylog.com';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  const posts = await getAllPosts();

  const items = posts
    .map((post) => {
      const url = `${SITE}/post/${post.id}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HooneyLog</title>
    <link>${SITE}</link>
    <description>HooneyLog Blog based on Notion API</description>
    <language>ko</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

- [ ] **Step 2: Advertise the feed in metadata**

In `apps/web/src/app/layout.tsx`, extend the `metadata.alternates` object to add the RSS type (keep the existing `canonical`):

```tsx
  alternates: {
    canonical: "/",
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'HooneyLog RSS' }],
    },
  }
```

- [ ] **Step 3: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS; `/feed.xml` appears in the route list.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/feed.xml/route.ts apps/web/src/app/layout.tsx
git commit -m "feat(distribution): RSS 2.0 feed at /feed.xml"
```

---

### Task 2: Dynamic Open Graph images

**Files:**
- Create: `apps/web/src/app/opengraph-image.tsx` (site default)
- Create: `apps/web/src/app/post/[slug]/opengraph-image.tsx` (per-post)
- Modify: `apps/web/src/app/post/[slug]/page.tsx` (remove the static OG image override so the file-based one is used)

**Interfaces:**
- Produces: 1200×630 PNG OG images. Per-post image shows the post title (when the Korean font loads), category, and brand.

- [ ] **Step 1: Site-default OG image**

Create `apps/web/src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HooneyLog';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#191919',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: '#0F7B6C',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ color: '#fff', fontSize: '56px', fontWeight: 700 }}>HooneyLog</div>
        </div>
        <div style={{ color: '#9b9b9b', fontSize: '28px', marginTop: '24px' }}>
          기록과 함께 성장하는 풀스택 개발자
        </div>
      </div>
    ),
    { ...size }
  );
}
```

Note: the tagline is decorative; if the runtime lacks a Korean glyph it degrades to boxes only on the site-default card, which is rarely surfaced. The per-post card (Step 2) guards Korean text behind a loaded font.

- [ ] **Step 2: Per-post OG image with graceful Korean font**

Create `apps/web/src/app/post/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { getPostById } from '@/lib/notion';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HooneyLog post';

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`;
    const css = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((r) => r.text());
    const match = css.match(/src:\s*url\((https:[^)]+)\)/);
    if (!match || !match[1]) return null;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostById(slug);
  const title = post?.title ?? 'HooneyLog';
  const category = post?.category ?? '';

  const fontData = await loadKoreanFont(title + category + '기록과 함께 성장하는 풀스택 개발자');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#191919',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#0F7B6C',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ color: '#9b9b9b', fontSize: '28px' }}>{category}</div>
        </div>
        {fontData ? (
          <div style={{ color: '#fff', fontSize: '60px', fontWeight: 700, lineHeight: 1.2, display: 'flex' }}>
            {title}
          </div>
        ) : (
          <div style={{ color: '#fff', fontSize: '56px', fontWeight: 700, display: 'flex' }}>HooneyLog</div>
        )}
        <div style={{ color: '#9b9b9b', fontSize: '26px' }}>hooneylog.com</div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Noto Sans KR', data: fontData, weight: 700 as const, style: 'normal' as const }] : [],
    }
  );
}
```

- [ ] **Step 3: Remove the static OG image override in the page metadata**

In `apps/web/src/app/post/[slug]/page.tsx` `generateMetadata`, remove the `images` array from `openGraph` and the `images` from `twitter` so Next uses the file-based `opengraph-image`. The `getCategoryImageSrc(post.category)` line used only for OG can stay if still used by JSON-LD; if it becomes unused, remove the local `categoryImage` const to keep lint clean. Resulting `openGraph`/`twitter`:

```tsx
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://hooneylog.com/post/${post.id}`,
      type: 'article',
      publishedTime: post.createdAt,
      authors: ['Hooney'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    }
```

(Keep `getCategoryImageSrc` import only if the JSON-LD `image` field still uses it — it does, via `image: getCategoryImageSrc(post.category)`. Remove only the now-unused `const categoryImage` if present.)

- [ ] **Step 4: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS. If the build environment cannot reach Google Fonts, `loadKoreanFont` returns null and the per-post card renders the brand fallback — the build still succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/opengraph-image.tsx "apps/web/src/app/post/[slug]/opengraph-image.tsx" "apps/web/src/app/post/[slug]/page.tsx"
git commit -m "feat(distribution): dynamic Open Graph images (site + per-post)"
```

---

### Task 3: Share buttons

**Files:**
- Create: `apps/web/src/components/blocks/post-detail/share-buttons.tsx`

**Interfaces:**
- Produces: `ShareButtons({ title, slug }: { title: string; slug: string })` — X, LinkedIn, and copy-link buttons.

- [ ] **Step 1: Create the component**

Create `apps/web/src/components/blocks/post-detail/share-buttons.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

const SITE = 'https://hooneylog.com';

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/post/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; no-op
    }
  };

  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const cls =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] border border-notion-border text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors no-underline cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2 my-10">
      <span className="text-[13px] text-notion-secondary mr-1">공유하기</span>
      <a href={x} target="_blank" rel="noopener noreferrer" className={cls} aria-label="X에 공유">X</a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={cls} aria-label="LinkedIn에 공유">LinkedIn</a>
      <button type="button" onClick={copy} className={cls} aria-label={copied ? '링크 복사됨' : '링크 복사'}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        {copied ? '복사됨' : '링크 복사'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/blocks/post-detail/share-buttons.tsx
git commit -m "feat(distribution): post share buttons"
```

---

### Task 4: Reading progress bar + back-to-top

**Files:**
- Create: `apps/web/src/components/elements/reading-progress.tsx`
- Create: `apps/web/src/components/elements/back-to-top.tsx`

**Interfaces:**
- Produces: `ReadingProgress()` — fixed top bar reflecting scroll fraction; `BackToTop()` — FAB appearing after scroll, scrolls to top.

- [ ] **Step 1: ReadingProgress**

Create `apps/web/src/components/elements/reading-progress.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
      <div className="h-full bg-accent transition-[width] duration-75" style={{ width: `${progress}%` }} />
    </div>
  );
}
```

- [ ] **Step 2: BackToTop**

Create `apps/web/src/components/elements/back-to-top.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full border border-notion-border bg-notion-bg text-notion-text shadow-sm hover:bg-notion-hover transition-colors flex items-center justify-center cursor-pointer"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
```

(Smooth scroll already degrades under `prefers-reduced-motion` via the global rule in globals.css that sets `scroll-behavior: auto`.)

- [ ] **Step 3: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/elements/reading-progress.tsx apps/web/src/components/elements/back-to-top.tsx
git commit -m "feat(distribution): reading progress bar and back-to-top"
```

---

### Task 5: Mount share / progress / back-to-top on the post page

**Files:**
- Modify: `apps/web/src/app/post/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ShareButtons`, `ReadingProgress`, `BackToTop` (Tasks 3, 4).

- [ ] **Step 1: Import and mount**

In `page.tsx`, add imports:

```tsx
import { ShareButtons } from '@/components/blocks/post-detail/share-buttons';
import { ReadingProgress } from '@/components/elements/reading-progress';
import { BackToTop } from '@/components/elements/back-to-top';
```

Mount `ReadingProgress` and `BackToTop` at the top of the returned tree (just inside the outermost wrapper, before/after the JSON-LD script), and place `ShareButtons` in the reading column after `<MarkdownRenderer>` and before `<MoveToAnotherPost>`:

```tsx
      <ReadingProgress />
      <BackToTop />
```

```tsx
              <MarkdownRenderer content={md} />
              <ShareButtons title={post.title} slug={slug} />
              <MoveToAnotherPost previousPost={previousPost ?? null} nextPost={nextPost ?? null} />
              <RelatedPosts posts={relatedPosts} />
```

- [ ] **Step 2: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 3: Manual check**

`pnpm --filter web dev`, open a post: thin accent progress bar fills as you scroll; back-to-top FAB appears after scrolling and returns to top; share buttons open X/LinkedIn and copy the link; `/feed.xml` returns RSS; view a post's `/post/<id>/opengraph-image` to confirm the OG card renders.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/src/app/post/[slug]/page.tsx"
git commit -m "feat(distribution): mount share, reading progress, and back-to-top on post page"
```

---

## Final Verification

Run: `pnpm --filter web test && pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: all PASS.

## Spec Coverage Map (#4)

| Spec item | Task |
|---|---|
| RSS feed `/feed.xml` + advertise | Task 1 |
| Dynamic OG images (site + per-post) | Task 2 |
| Share buttons (X, LinkedIn, copy) | Tasks 3, 5 |
| Reading progress bar | Tasks 4, 5 |
| Back-to-top | Tasks 4, 5 |
