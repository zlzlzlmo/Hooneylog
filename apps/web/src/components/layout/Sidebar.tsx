'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
}

export function Sidebar({ categories, currentActiveCategory, handleCurrentActiveCategory }: CategoryProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-120px)] pb-10">
      {/* Profile Section */}
      <div className="hidden lg:flex flex-col mb-8 p-4 bg-notion-gray-bg/50 rounded-lg border border-notion-border">
        <div className="w-[48px] h-[48px] relative rounded-full overflow-hidden mb-3 border border-notion-border bg-white">
          <Image src="/images/profile.png" alt="Seunghoon Shin" fill className="object-cover" />
        </div>
        <h3 className="font-semibold text-notion-text text-[15px] mb-1">Seunghoon Shin</h3>
        <p className="text-[13px] text-notion-secondary leading-snug">
          기록과 함께 성장해 나가는<br/>프론트엔드 개발자
        </p>
      </div>

      <div className="text-[12px] font-semibold text-notion-secondary mb-2 px-2 uppercase tracking-wider hidden lg:block">
        Categories
      </div>
      <ul className="flex flex-row lg:flex-col gap-1 lg:gap-0 m-0 p-0 list-none overflow-x-auto lg:overflow-x-visible no-scrollbar pb-4 lg:pb-0">
        {categories.map(([name]) => {
          const isActive = name === currentActiveCategory;
          
          return (
            <li key={name} className="flex-shrink-0">
              <button 
                onClick={() => handleCurrentActiveCategory(name)}
                className={`
                  w-full text-left py-1.5 px-3 rounded-[4px] text-[15px] transition-colors appearance-none bg-transparent border-none outline-none cursor-pointer flex items-center
                  ${isActive 
                    ? 'font-medium text-notion-text bg-notion-hover' 
                    : 'text-notion-secondary font-regular hover:bg-notion-hover hover:text-notion-text'
                  }
                `}
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
