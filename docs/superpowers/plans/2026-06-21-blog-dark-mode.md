# Blog Dark Mode (#3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Add a light/dark theme with a header toggle, system default, persistence, and no flash of the wrong theme — adapting the existing token-based components automatically and sweeping the remaining hardcoded colors.

**Architecture:** Tailwind v4 class strategy. Switch `@theme inline` → `@theme` so color utilities reference `var(--color-*)` (required for runtime override); add `@custom-variant dark` and a `.dark { ... }` token-override block. A pre-paint inline script sets `.dark` before render. A `ThemeToggle` client component flips it. Remaining hardcoded colors get `dark:` variants.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 CSS-first, lucide-react.

## Global Constraints

- pnpm 9. Full check (build is the real gate for CSS var changes): `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`. Tests: `pnpm --filter web test`.
- Tailwind v4 CSS-first. After this plan, color tokens are defined with `@theme` (NOT `@theme inline`) so `.dark` overrides cascade. `@custom-variant dark (&:where(.dark, .dark *));`.
- TypeScript strict (`noUncheckedIndexedAccess`); no `as any`.
- Korean copy `습니다`/noun style. New client components declare `'use client'`.
- Theme state: `localStorage.theme` ∈ {`'light'`,`'dark'`}; absence → `prefers-color-scheme`. The `.dark` class lives on `<html>`.

---

### Task 1: Dark tokens + variant in globals.css

**Files:**
- Modify: `apps/web/src/app/globals.css`

**Interfaces:**
- Produces: `dark:` variant available; `.dark` overrides all `--color-*` tokens so token-based utilities theme automatically.

- [ ] **Step 1: Switch to non-inline theme + add the dark variant and overrides**

Replace the top of `globals.css` (the `@import`, the `@theme inline { ... }` block, and the `:root` block) with the following. Keep the rest of the file (the `body`, `@layer utilities`, `:target`, and `prefers-reduced-motion` blocks) unchanged:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-notion-bg: #FFFFFF;
  --color-notion-text: #37352F;
  --color-notion-text-light: rgba(55, 53, 47, 0.65);
  --color-notion-border: rgba(55, 53, 47, 0.16);
  --color-notion-hover: rgba(55, 53, 47, 0.08);
  --color-notion-gray-bg: #F1F1EF;
  --color-notion-blue-bg: #E7F3F8;
  --color-notion-blue-text: #0B6E99;

  --container-max: 720px;
  --breakpoint-mobile: 768px;

  --font-sans: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Segoe UI', Roboto, 'Malgun Gothic', 'Noto Sans KR', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --font-serif: Georgia, 'Nanum Myeongjo', 'Apple SD Gothic Neo', serif;
  --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;

  --color-accent: #0F7B6C;
  --color-accent-bg: #E3F2EF;
}

:root {
  --background: var(--color-notion-bg);
  --foreground: var(--color-notion-text);
}

.dark {
  --color-notion-bg: #191919;
  --color-notion-text: #E6E6E5;
  --color-notion-text-light: rgba(235, 235, 235, 0.55);
  --color-notion-border: rgba(255, 255, 255, 0.13);
  --color-notion-hover: rgba(255, 255, 255, 0.055);
  --color-notion-gray-bg: #2C2C2C;
  --color-notion-blue-bg: #1D3A4D;
  --color-notion-blue-text: #5BA8C9;
  --color-accent: #4FD1C5;
  --color-accent-bg: #1D3330;
}
```

- [ ] **Step 2: Verify build (utilities still resolve, no CSS errors)**

Run: `pnpm --filter web lint && pnpm --filter web build`
Expected: build succeeds. (Visual dark mode is not active until the toggle/script land; this step only confirms the CSS compiles and `bg-notion-*` utilities still work.)

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(theme): dark variant + .dark token overrides (non-inline @theme)"
```

---

### Task 2: No-flash theme script in the root layout

**Files:**
- Modify: `apps/web/src/app/layout.tsx`

**Interfaces:**
- Produces: `<html>` gets `.dark` before paint when appropriate; `suppressHydrationWarning` avoids the class-mismatch warning.

- [ ] **Step 1: Add suppressHydrationWarning and the pre-paint script**

In `layout.tsx`, add `suppressHydrationWarning` to the `<html>` tag, and add an inline script as the first child of `<body>` (before `<AppLayout>`):

```tsx
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-full flex flex-col m-0 p-0 text-notion-text bg-notion-bg">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <AppLayout>{children}</AppLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
```

- [ ] **Step 2: Verify lint/typecheck**

Run: `pnpm --filter web lint && pnpm --filter web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat(theme): pre-paint no-flash theme script"
```

---

### Task 3: ThemeToggle component + header slot

**Files:**
- Create: `apps/web/src/components/layout/theme-toggle.tsx`
- Modify: `apps/web/src/components/layout/header.tsx`

**Interfaces:**
- Produces: `ThemeToggle` (client) — reads current theme on mount, toggles `.dark`, persists to `localStorage.theme`.

- [ ] **Step 1: Create the ThemeToggle**

Create `apps/web/src/components/layout/theme-toggle.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // storage unavailable; no-op
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-pressed={isDark}
      className="flex items-center justify-center w-9 h-9 rounded-[6px] text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors cursor-pointer"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {mounted && isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
```

- [ ] **Step 2: Add the toggle to the header and make the header dark-aware**

Replace `header.tsx` with a version that keeps the monogram/brand link, adds a right-aligned action slot with the toggle, uses the bg token, and makes the monogram use the accent (so it reads in both themes):

```tsx
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-notion-bg/80 backdrop-blur-md border-b border-notion-border flex items-center justify-between px-4 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 h-full px-2 rounded-[4px] hover:bg-notion-hover transition-colors"
      >
        <span
          aria-hidden="true"
          className="w-[24px] h-[24px] rounded-[6px] bg-accent text-white flex items-center justify-center font-bold text-[14px] tracking-tight"
        >
          H
        </span>
        <span className="font-semibold text-[15px] text-notion-text tracking-tight">HooneyLog</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
```

- [ ] **Step 3: Verify lint/typecheck + tests (header.test.tsx still passes)**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test -- src/components/layout/header.test.tsx`
Expected: PASS — the existing header test checks the HooneyLog link and the "H" monogram text, both preserved.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/layout/theme-toggle.tsx apps/web/src/components/layout/header.tsx
git commit -m "feat(theme): header dark-mode toggle"
```

---

### Task 4: Hardcoded-color sweep

**Files:**
- Modify: `apps/web/src/components/layout/app-layout.tsx`
- Modify: `apps/web/src/components/features/search.tsx`
- Modify: `apps/web/src/components/layout/sidebar.tsx`
- Modify: `apps/web/src/components/blocks/post-detail/markdown-renderer.tsx`

**Interfaces:** none (style-only). Replaces literals that don't adapt to `.dark` with tokens or `dark:` variants.

- [ ] **Step 1: app-layout background → token**

In `app-layout.tsx`, change the outer wrapper `bg-white` to `bg-notion-bg`:

```tsx
    <div className="min-h-screen flex flex-col bg-notion-bg">
```

- [ ] **Step 2: search input background → token**

In `search.tsx`, on the input container `div`, change `bg-white` to `bg-notion-bg`:

```tsx
      <div className="flex items-center w-full bg-notion-bg border border-notion-border rounded-[4px] px-3 py-2 transition-all focus-within:border-[#A1A1AA] focus-within:shadow-[0_0_0_2px_rgba(46,170,220,0.2)]">
```

- [ ] **Step 3: sidebar avatar wrapper background → token**

In `sidebar.tsx`, the profile avatar wrapper uses `bg-white`; change it to `bg-notion-bg`:

```tsx
        <div className="w-[48px] h-[48px] relative rounded-full overflow-hidden mb-3 border border-notion-border bg-notion-bg">
```

- [ ] **Step 4: markdown-renderer inline code + table head → dark variants**

In `markdown-renderer.tsx`:

Inline code (`bg-gray-100 text-[#B91C1C]`) — add dark variants:

```tsx
              <code className="bg-gray-100 dark:bg-[#2C2C2C] text-[#B91C1C] dark:text-[#F0918B] px-1.5 py-0.5 rounded-[3px] text-[0.9em] font-mono break-words" {...props}>
```

Table head (`bg-[#F7F6F3]`) — add a dark variant:

```tsx
            return <thead className="bg-[#F7F6F3] dark:bg-[#2C2C2C]" {...props}>{children as React.ReactNode}</thead>;
```

- [ ] **Step 5: Verify lint/typecheck/build**

Run: `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 6: Manual check**

`pnpm --filter web dev`: toggle in header flips theme with no flash on reload; home, post, sidebar, search, code blocks, tables, tags all readable in dark. (Known follow-ups, out of scope: giscus comment theme and Mermaid diagram theme do not yet follow dark mode — note for #4/later.)

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/layout/app-layout.tsx apps/web/src/components/features/search.tsx apps/web/src/components/layout/sidebar.tsx apps/web/src/components/blocks/post-detail/markdown-renderer.tsx
git commit -m "feat(theme): dark-mode color sweep for remaining literals"
```

---

## Final Verification

Run: `pnpm --filter web test && pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`
Expected: all PASS.

## Spec Coverage Map (#3)

| Spec item | Task |
|---|---|
| Class strategy + `.dark` token overrides | Task 1 |
| No-flash pre-paint script | Task 2 |
| Toggle (system default, persisted) | Tasks 2, 3 |
| Hardcoded-color sweep | Task 4 |
| Known out-of-scope: giscus/mermaid theme sync | noted |
