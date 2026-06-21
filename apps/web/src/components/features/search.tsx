'use client';

import { BiSearch, BiX } from 'react-icons/bi';

interface SearchProps {
  searchValue: string;
  handleSearchValue: (text: string) => void;
}

export function Search({ searchValue, handleSearchValue }: SearchProps) {
  return (
    <section className="w-full relative mb-6 group">
      <div className="flex items-center w-full bg-notion-bg border border-notion-border rounded-[4px] px-3 py-2 transition-all focus-within:border-[#A1A1AA] focus-within:shadow-[0_0_0_2px_rgba(46,170,220,0.2)]">
        <BiSearch className="w-5 h-5 text-notion-secondary flex-shrink-0" aria-hidden="true" />
        <label htmlFor="post-search" className="sr-only">포스트 검색</label>
        <input
          id="post-search"
          type="search"
          placeholder="제목·내용 검색..."
          value={searchValue}
          onChange={(e) => handleSearchValue(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[15px] ml-2 text-notion-text placeholder:text-notion-secondary/60 [&::-webkit-search-cancel-button]:hidden"
        />
        {searchValue && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => handleSearchValue('')}
            className="flex-shrink-0 p-1 rounded-full text-notion-secondary hover:text-notion-text hover:bg-notion-hover transition-colors cursor-pointer"
          >
            <BiX className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
