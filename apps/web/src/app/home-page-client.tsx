'use client';

import { useEffect, useState } from 'react';
import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/use-filter-post';
import { CategoryCount } from '@/utils/category';
import { Search } from '@/components/features/search';
import { Sidebar } from '@/components/layout/sidebar';
import { PostItemList } from '@/components/blocks/post-item-list';

import { viewsService } from '@/services/views';

export function HomePageClient({ 
  initialPosts, 
  stats: initialStats,
  viewsMap: initialViewsMap
}: { 
  initialPosts: NotionPost[],
  stats: { total: number, today: number },
  viewsMap: Record<string, number>
}) {
  const [stats, setStats] = useState(initialStats);
  const [viewsMap, setViewsMap] = useState(initialViewsMap);

  const {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts
  } = useFilterPost(initialPosts);

  const categoryCount = new CategoryCount(initialPosts);

  // 💡 실시간 데이터 동기화 (ISR 캐시 우회)
  useEffect(() => {
    const syncViews = async () => {
      // 1. 전체 통계 가져오기 (증가 X)
      const latestStats = await viewsService.getStats({ increment: false });
      setStats(latestStats);

      // 2. 현재 페이지의 포스트들 조회수 가져오기 (서비스 레이어 사용)
      const slugs = initialPosts.map(p => p.id);
      const latestViews = await viewsService.getMultipleCounts(slugs);
      setViewsMap(latestViews);
    };

    syncViews();
  }, [initialPosts]);

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
            <PostItemList posts={filteredPosts} viewsMap={viewsMap} />
          </div>
        </div>
      </div>
  );
}
