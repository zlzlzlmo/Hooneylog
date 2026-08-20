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
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return activeSlug;
}

// Inline (mobile) list — simple mono links.
function TocLinks({ items, activeSlug }: { items: TocItem[]; activeSlug: string }) {
  return (
    <ul className="m-0 p-0 list-none space-y-1 font-mono text-[12px]">
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

// Desktop (rail) list — the TRACE trace rail: a hairline with diamond nodes.
function TocRail({ items, activeSlug }: { items: TocItem[]; activeSlug: string }) {
  return (
    <ul className="relative m-0 p-0 list-none">
      {/* Vertical hairline the nodes ride on */}
      <span
        aria-hidden="true"
        className="absolute left-[4px] top-2 bottom-2 w-[2px] bg-notion-border"
      />
      {items.map((item) => {
        const active = activeSlug === item.slug;
        return (
          <li key={item.slug} className="relative pl-5">
            {/* Rail node (diamond) — filled + soft ring on active, hollow otherwise */}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-[1.5px] transition-all duration-200 ${
                active
                  ? 'bg-accent border-accent ring-[3px] ring-accent/20'
                  : 'bg-notion-bg border-notion-border'
              }`}
            />
            <a
              href={`#${item.slug}`}
              aria-current={active ? 'true' : undefined}
              className={`block no-underline font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg rounded-[3px] ${
                item.depth === 3 ? 'py-[3px] pl-3 text-[11px]' : 'py-[5px] text-[12px]'
              } ${active ? 'text-notion-text' : 'text-notion-secondary hover:text-notion-text'}`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function TableOfContents({
  items,
  variant,
}: {
  items: TocItem[];
  variant: 'inline' | 'rail';
}) {
  const activeSlug = useActiveSlug(items);

  if (items.length === 0) return null;

  if (variant === 'inline') {
    // Mobile: collapsible at top of the reading column (hidden at xl+)
    return (
      <details className="xl:hidden mb-8 rounded-[4px] border border-notion-border bg-notion-gray-bg/40 px-4 py-3">
        <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em] text-notion-secondary select-none">
          trace
        </summary>
        <nav aria-label="목차" className="mt-3">
          <TocLinks items={items} activeSlug={activeSlug} />
        </nav>
      </details>
    );
  }

  // Desktop: sticky trace rail in the side column (hidden below xl)
  return (
    <nav aria-label="목차" className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-notion-secondary mb-3">
        trace
      </p>
      <TocRail items={items} activeSlug={activeSlug} />
    </nav>
  );
}
