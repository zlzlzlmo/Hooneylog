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
        const first = visible[0];
        if (first) {
          setActiveSlug(first.target.id);
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
