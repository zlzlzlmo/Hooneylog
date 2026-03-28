'use client';

import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/useFilterPost';
import { CategoryCount } from '@/utils/category';
import { Introduction } from '@/components/blocks/Introduction';
import { Search } from '@/components/features/Search';
import { Category } from '@/components/features/Category';
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
      <Search 
        searchValue={searchValue} 
        handleSearchValue={setSearchValue} 
      />
      <Category 
        categories={categoryCount.orderedListByDescendingCount}
        currentActiveCategory={currentActiveCategory}
        handleCurrentActiveCategory={setCurrentActiveCategory}
      />
      <PostItemList posts={filteredPosts} />
    </>
  );
}
