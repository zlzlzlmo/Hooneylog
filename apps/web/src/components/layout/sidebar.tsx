'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AUTHOR } from '@/lib/author';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
  stats?: { total: number, today: number };
}

export function Sidebar({ categories, currentActiveCategory, handleCurrentActiveCategory, stats }: CategoryProps) {
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Tracks which horizontal edges still have off-screen content, to show the
  // appropriate scroll-affordance fade (right by default, left once scrolled).
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);

  // Scroll the active chip into view on mount and whenever it changes.
  // `block: 'nearest'` prevents the page from jumping vertically; `inline: 'center'`
  // centers the active chip within the horizontal mobile scroller.
  useEffect(() => {
    activeButtonRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
    updateEdges();
  }, [currentActiveCategory, updateEdges]);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  // Build a horizontal mask that fades only the edges that have hidden content.
  const leftStop = edges.left ? 'transparent, black 24px' : 'black, black';
  const rightStop = edges.right ? 'black calc(100% - 24px), transparent' : 'black, black';
  const maskImage = `linear-gradient(to right, ${leftStop}, ${rightStop})`;

  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-120px)] pb-10">
      {/* Profile Section */}
      <div className="flex flex-col mb-8 p-4 bg-notion-gray-bg rounded-lg border border-notion-border">
        <div className="w-[48px] h-[48px] relative rounded-full overflow-hidden mb-3 border border-notion-border bg-notion-bg">
          <Image src={AUTHOR.avatar} alt={AUTHOR.name} fill className="object-cover" />
        </div>
        <h3 className="font-semibold text-notion-text text-[15px] mb-1">{AUTHOR.name}</h3>
        <p className="text-[13px] text-notion-secondary leading-snug mb-4">
          {AUTHOR.tagline}
        </p>

        {/* Blog Stats Section */}
        {stats && (
          <div className="flex flex-col gap-1.5 pt-4 border-t border-notion-border">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-notion-secondary font-medium">총 조회수</span>
              <span className="font-mono text-notion-text font-medium">{stats.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-notion-secondary font-medium">오늘</span>
              <span className="font-mono text-notion-text font-medium text-accent">+{stats.today.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-[12px] font-semibold text-notion-secondary mb-2 px-2 uppercase tracking-wider">
        카테고리
      </div>
      {/*
        Edge-fade affordance for the horizontally-scrolling mobile row so users know
        more categories exist off-screen: the right edge fades while content is hidden
        there, and the left edge fades once the row has been scrolled. The mask is
        removed for the lg: vertical layout via the `lg:[mask-image:none]!` override.
      */}
      <div
        className="relative lg:[mask-image:none]!"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <ul
          ref={listRef}
          onScroll={updateEdges}
          aria-label="카테고리 필터"
          className="flex flex-row lg:flex-col gap-1 lg:gap-0 m-0 p-0 list-none overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-450px)] no-scrollbar pb-4 lg:pb-0"
        >
          {categories.map(([name, count]) => {
            const isActive = name === currentActiveCategory;

            return (
              <li key={name} className="flex-shrink-0">
                <button
                  ref={isActive ? activeButtonRef : undefined}
                  type="button"
                  onClick={() => handleCurrentActiveCategory(name)}
                  aria-pressed={isActive}
                  className={`
                    w-full text-left py-2.5 lg:py-1.5 px-3 rounded-[4px] text-[15px] transition-colors appearance-none bg-transparent cursor-pointer flex items-center justify-between gap-2
                    border-b-2 lg:border-b-0 lg:border-l-2
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                    active:bg-notion-hover active:scale-[0.99]
                    ${isActive
                      ? 'font-medium text-accent bg-notion-hover border-accent'
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
      </div>
    </aside>
  );
}
