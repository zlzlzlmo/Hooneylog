'use client';

import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/useFilterPost';
import { CategoryCount } from '@/utils/category';
import { Introduction } from '@/components/blocks/Introduction';
import { Search } from '@/components/features/Search';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostItemList } from '@/components/blocks/PostItemList';

export function HomePageClient({ initialPosts }: { initialPosts: NotionPost[] }) {
  const {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts
  } = useFilterPost(initialPosts);

  const categoryCount = new CategoryCount(initialPosts);

  return (
    <>
      <Introduction />
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full mx-auto px-2 items-start">
        {/* Sidebar for Categories */}
        <Sidebar 
          categories={categoryCount.orderedListByDescendingCount}
          currentActiveCategory={currentActiveCategory}
          handleCurrentActiveCategory={setCurrentActiveCategory}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <Search 
            searchValue={searchValue} 
            handleSearchValue={setSearchValue} 
          />
          <div className="mt-8">
            <PostItemList posts={filteredPosts} />
          </div>
        </div>
      </div>
    </>
  );
}
