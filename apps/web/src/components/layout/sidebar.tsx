'use client';

import Image from 'next/image';
import { AUTHOR } from '@/lib/author';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
  stats?: { total: number, today: number };
}

export function Sidebar({ categories, currentActiveCategory, handleCurrentActiveCategory, stats }: CategoryProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-120px)] pb-10">
      {/* Profile Section */}
      <div className="flex flex-col mb-8 p-4 bg-notion-gray-bg/50 rounded-lg border border-notion-border">
        <div className="w-[48px] h-[48px] relative rounded-full overflow-hidden mb-3 border border-notion-border bg-white">
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
              <span className="text-notion-secondary font-medium">Total Views</span>
              <span className="font-mono text-notion-text font-medium">{stats.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-notion-secondary font-medium">Today</span>
              <span className="font-mono text-notion-text font-medium text-accent">+{stats.today.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-[12px] font-semibold text-notion-secondary mb-2 px-2 uppercase tracking-wider">
        Categories
      </div>
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
    </aside>
  );
}
