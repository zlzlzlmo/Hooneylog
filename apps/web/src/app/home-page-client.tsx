'use client';

import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/use-filter-post';
import { CategoryCount } from '@/utils/category';
import { Search } from '@/components/features/search';
import { Sidebar } from '@/components/layout/sidebar';
import { PostItemList } from '@/components/blocks/post-item-list';

export function HomePageClient({ 
  initialPosts, 
  stats 
}: { 
  initialPosts: NotionPost[],
  stats: { total: number, today: number }
}) {
  const {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts
  } = useFilterPost(initialPosts);

  const categoryCount = new CategoryCount(initialPosts);

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full mx-auto px-2 items-start mt-8">
      {/* Sidebar for Categories */}
        <Sidebar 
          categories={categoryCount.orderedListByDescendingCount}
          currentActiveCategory={currentActiveCategory}
          handleCurrentActiveCategory={setCurrentActiveCategory}
          stats={stats}
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
  );
}
