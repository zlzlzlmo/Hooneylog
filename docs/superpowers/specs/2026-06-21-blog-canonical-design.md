# Hooneylog — Canonical Blog Features Design

**Goal:** Bring Hooneylog up to a canonical tech-blog standard across four independent sub-projects: (1) reading experience, (2) content discovery, (3) dark mode, (4) distribution.

**Status:** Design approved for #1 (interactively). #2–#4 use canonical defaults documented here; open to revision.

**Stack facts (verified):** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 CSS-first (`globals.css` `@theme inline`, no config file). Post detail `/post/[slug]/page.tsx` renders the body via **`MarkdownRenderer`** (markdown from notion-to-md) — this is the main render path. `NotionPost = { id, category, createdAt, description, tags: {id,name}[], title }` (id doubles as slug; no updatedAt). Home list is client-filtered via `useFilterPost` (search over title+description, category filter).

Each sub-project ships independently (own plan, own multi-agent wave set). Build order: **#1 → #2 → #4 → #3** (dark mode last, since it is a cross-cutting token sweep best done once the component set is stable).

---

## Sub-project #1 — Reading Experience

Operates on the post detail page, main path = `markdown-renderer.tsx`.

**Decisions (approved):** TOC = desktop right sticky rail + mobile top collapsible; implement on the markdown path; reading time = Korean char-based.

**Components / changes**
- **Heading anchors:** add `rehype-slug` to `MarkdownRenderer` rehypePlugins so h1/h2/h3 get `id`s. The custom `h2`/`h3` component overrides render a hover `#` anchor link to `#${id}`. Sticky-header offset already handled by existing `:target { scroll-margin-top: 72px }`.
- **TOC extraction:** pure `extractToc(markdown: string): TocItem[]` where `TocItem = { depth: 2 | 3; text: string; slug: string }`. Slugs generated with `github-slugger` (same lib rehype-slug uses) so they match the rendered `id`s exactly. Only h2/h3 included.
- **`TableOfContents` (client):** renders the list; IntersectionObserver scroll-spy highlights the active section; click → smooth scroll. Desktop (xl+): sticky right rail. Below xl: a `<details>` "목차" block at the top of the article.
- **Reading time:** pure `readingTime(markdown: string): number` — strip fenced code blocks, count characters, `ceil(chars / 500)`, min 1. Display "약 N분" in `PostHeader` next to date/views.
- **Code copy button:** new client `CodeBlock` wraps the SyntaxHighlighter in `markdown-renderer.tsx`'s fenced-code branch; a top-right "복사"/"복사됨" button using `navigator.clipboard`.
- **Layout:** `page.tsx` body changes from single `max-w-[720px]` column to an xl grid `[720px main][~220px TOC rail]`; below xl the rail is hidden and the collapsible TOC shows at top.

**Files:** new `utils/toc.ts` (+test), `components/blocks/post-detail/table-of-contents.tsx`, `components/blocks/post-detail/code-block.tsx`; modify `markdown-renderer.tsx`, `post-header.tsx`, `post/[slug]/page.tsx`. Deps: `rehype-slug`, `github-slugger`.

**Testing:** unit tests for `extractToc` (slug matches github-slugger, h2/h3 only, code fences ignored) and `readingTime` (Korean char count, code stripped, min 1). TOC component render + a basic active-state test where feasible.

---

## Sub-project #2 — Content Discovery

**Decisions (defaults):** Tags rendered as chips → dedicated tag pages; related posts by category+tag scoring; home list uses a "더 보기" (load-more) button.

**Components / changes**
- **Tag chips:** `PostHeader` renders `post.tags` as chips linking to `/tag/${encodeURIComponent(name)}`. A small `TagList` component reused on cards/header.
- **Tag pages:** `app/tag/[tag]/page.tsx` — lists all posts whose tags include the param (decoded). Reuses `PostItemList`. `generateStaticParams` over unique tag names. Per-tag `generateMetadata` (title "태그: X | HooneyLog", canonical `/tag/x`). Empty state if none.
- **Related posts:** pure `getRelatedPosts(all, current, limit=3)` — score `+2` same category, `+1` per shared tag; exclude current; sort desc; take top N. New `RelatedPosts` component on post detail, placed above comments (after adjacent nav). Hidden if none.
- **Load-more:** home post list shows `PAGE_SIZE = 12` at a time with a "더 보기" button; the visible count resets to 12 whenever the active filter/search changes. Implemented in `home-page-client.tsx` (state) + `PostItemList` (already presentational) or a thin wrapper. All posts remain in client data so search/filter is unaffected; only initial DOM is bounded.

**Files:** new `utils/related-posts.ts` (+test), `components/elements/tag-list.tsx`, `components/blocks/post-detail/related-posts.tsx`, `app/tag/[tag]/page.tsx`; modify `post-header.tsx`, `post-item-list.tsx` (optional eyebrow tag), `home-page-client.tsx`, `post/[slug]/page.tsx`.

**Testing:** unit tests for `getRelatedPosts` (scoring, exclusion, limit) and load-more reset behavior; tag page render with a mocked post set.

---

## Sub-project #3 — Dark Mode (cross-cutting, build last)

**Decisions (defaults):** Tailwind v4 class strategy; system default; persisted; no-flash.

**Approach**
- Add `@custom-variant dark (&:where(.dark, .dark *));` to `globals.css` and a `.dark { ... }` block overriding every `--color-notion-*` and accent token with dark equivalents (background near `#191919`, text `#E6E6E5`, borders/hover adjusted, accent tuned for dark contrast). Because components already use `notion-*`/`accent` tokens, most adapt automatically.
- **No-flash script:** inline `<script>` in `layout.tsx` `<head>` that, before paint, reads `localStorage.theme` (or `prefers-color-scheme`) and sets `document.documentElement.classList`.
- **Toggle:** `ThemeToggle` (client) in the header action slot — cycles light/dark, writes `localStorage.theme`, toggles `.dark`. Sun/moon icon (lucide), `aria-label`, `aria-pressed`.
- **Hardcoded-color sweep:** replace remaining literals (`bg-white`, `bg-gray-100` inline code, `#B91C1C`, header `bg-white/90`, fallback gradients, table `bg-[#F7F6F3]`) with token-based `dark:` variants or tokens. Code syntax theme stays `vscDarkPlus` (dark) in both modes — acceptable; revisit only if it reads poorly on light.

**Files:** modify `globals.css` (variant + `.dark` tokens), `layout.tsx` (no-flash script), `header.tsx` (toggle slot), new `components/layout/theme-toggle.tsx`; targeted `dark:` touch-ups in components with hardcoded colors.

**Testing:** `ThemeToggle` behavior (toggles class, persists) where jsdom allows; manual visual pass in both modes.

---

## Sub-project #4 — Distribution

**Decisions (defaults):** RSS 2.0 at `/feed.xml`; dynamic OG images via `next/og`; share buttons (X, LinkedIn, copy); scroll progress bar + back-to-top.

**Components / changes**
- **RSS:** `app/feed.xml/route.ts` — GET handler builds RSS 2.0 from `getAllPosts()` (title, link `https://hooneylog.com/post/${id}`, description, pubDate, category). `Content-Type: application/xml`, revalidated. Link `<link rel="alternate" type="application/rss+xml">` added in `layout.tsx` metadata.
- **Dynamic OG images:** `app/post/[slug]/opengraph-image.tsx` using `ImageResponse` (`next/og`) rendering title + category + author on a branded background (1200×630). `app/opengraph-image.tsx` for the site default. Remove the static category-image OG override in `page.tsx` `generateMetadata` (the file-based opengraph-image takes over) — verify Next picks it up.
- **Share buttons:** `ShareButtons` (client) on post detail — X intent URL, LinkedIn share URL, copy-link (clipboard + "복사됨"). Placed after the post body / near adjacent nav. `aria-label`s.
- **Scroll progress + back-to-top:** `ReadingProgress` (client) thin fixed top bar reflecting scroll fraction; `BackToTop` (client) FAB appearing after ~600px scroll, smooth-scrolls to top, respects `prefers-reduced-motion`. Both mounted on the post detail page.

**Files:** new `app/feed.xml/route.ts`, `app/post/[slug]/opengraph-image.tsx`, `app/opengraph-image.tsx`, `components/blocks/post-detail/share-buttons.tsx`, `components/elements/reading-progress.tsx`, `components/elements/back-to-top.tsx`; modify `layout.tsx` (RSS link), `post/[slug]/page.tsx` (mount share/progress/back-to-top), and remove static OG override in `generateMetadata`. Dep: `next/og` is bundled with Next — no new dep expected (verify).

**Testing:** RSS route returns valid XML with expected items (unit/integration); OG route renders without throwing; share URL construction unit-tested; progress/back-to-top behavior where jsdom allows.

---

## Cross-cutting constraints

- Tailwind v4 CSS-first: every color utility maps to a `--color-*` token in `globals.css`. No new undefined tokens.
- TypeScript strict; project lint forbids `as any` and warns on raw `<img>` (use typed test mocks; `next/image` where practical).
- Korean copy in `습니다`/noun style consistent with existing UI.
- Each new client component declares `'use client'`; keep server components server-only.
- Verification per area: `pnpm --filter web lint && typecheck && test && build` all green before merge.
- Execution: subagent-driven multi-agent, file-area batched parallel waves (agents own disjoint files, do not commit; controller commits serially), then a final whole-branch review per area or for the combined branch.

## Out of scope (YAGNI for now)

Series/collections, newsletter signup, full-text server search, comments beyond existing giscus, i18n, author/about page, image lightbox/zoom, featured/pinned posts. Revisit later if desired.
