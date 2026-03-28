'use client';

import Link from 'next/link';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
}

export function Sidebar({ categories, currentActiveCategory, handleCurrentActiveCategory }: CategoryProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-120px)] pb-10">
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
