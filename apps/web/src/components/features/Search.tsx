'use client';

import { BiSearch } from 'react-icons/bi';

interface SearchProps {
  searchValue: string;
  handleSearchValue: (text: string) => void;
}

export function Search({ searchValue, handleSearchValue }: SearchProps) {
  return (
    <section className="w-full h-16 border-[0.2rem] border-sub rounded-lg overflow-hidden relative mb-4">
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={searchValue}
        onChange={(e) => handleSearchValue(e.target.value)}
        className="border-none h-full pl-20 w-full outline-none caret-sub text-[1.8rem] bg-transparent"
      />
      <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 text-main" />
    </section>
  );
}
