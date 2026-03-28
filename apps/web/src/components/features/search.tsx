'use client';

import { BiSearch } from 'react-icons/bi';

interface SearchProps {
  searchValue: string;
  handleSearchValue: (text: string) => void;
}

export function Search({ searchValue, handleSearchValue }: SearchProps) {
  return (
    <section className="w-full relative mb-6 group">
      <div className="flex items-center w-full bg-white border border-notion-border rounded-[4px] px-3 py-2 transition-all focus-within:border-[#A1A1AA] focus-within:shadow-[0_0_0_2px_rgba(46,170,220,0.2)]">
        <BiSearch className="w-5 h-5 text-notion-secondary flex-shrink-0" />
        <input
          type="text"
          placeholder="검색어를 입력하세요..."
          value={searchValue}
          onChange={(e) => handleSearchValue(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[15px] ml-2 text-notion-text placeholder:text-notion-secondary/60"
        />
      </div>
    </section>
  );
}
