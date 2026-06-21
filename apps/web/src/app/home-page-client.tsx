'use client';

import { useEffect, useState } from 'react';

const PAGE_SIZE = 12;
import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/use-filter-post';
import { ALL, CategoryCount } from '@/utils/category';
import { Search } from '@/components/features/search';
import { Sidebar } from '@/components/layout/sidebar';
import { PostItemList } from '@/components/blocks/post-item-list';
import { AUTHOR } from '@/lib/author';

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

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 검색 결과 개수는 별도 상태로 디바운스해서, 스크린리더에 한 번만 알려줘요.
  const [announcedCount, setAnnouncedCount] = useState(filteredPosts.length);

  // 더 보기로 추가 로드했을 때 스크린리더에 알려줄 메시지예요.
  const [loadMoreAnnouncement, setLoadMoreAnnouncement] = useState('');

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchValue, currentActiveCategory]);

  // 입력값은 즉시 필터링하되, 안내 문구만 약 200ms 디바운스해요.
  useEffect(() => {
    const id = setTimeout(() => {
      setAnnouncedCount(filteredPosts.length);
    }, 200);
    return () => clearTimeout(id);
  }, [filteredPosts.length]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = filteredPosts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((c) => {
      const next = c + PAGE_SIZE;
      const loaded = Math.min(filteredPosts.length, next) - c;
      setLoadMoreAnnouncement(`${loaded}개를 더 불러왔어요`);
      return next;
    });
  };

  const handleReset = () => {
    setSearchValue('');
    setCurrentActiveCategory(ALL);
  };

  // 💡 실시간 데이터 동기화 (ISR 캐시 우회)
  useEffect(() => {
    const syncViews = async () => {
      try {
        // 1. 전체 통계 가져오기 (증가 X)
        const latestStats = await viewsService.getStats({ increment: false });

        // 2. 현재 페이지의 포스트들 조회수 가져오기 (서비스 레이어 사용)
        const slugs = initialPosts.map(p => p.id);
        const latestViews = await viewsService.getMultipleCounts(slugs);

        // 성공했을 때만 상태를 갱신해서, 숫자가 깜빡이거나 0으로 덮어쓰는 일을 막아요.
        setStats(latestStats);
        setViewsMap(latestViews);
      } catch (error) {
        // 실패하면 서버에서 받은 초기값을 그대로 유지해요.
        console.error('Failed to sync view counts:', error);
      }
    };

    syncViews();
  }, [initialPosts]);

  return (
    <div className="w-full mx-auto px-2 mt-8">
      {/* Intro band */}
      <header className="mb-8 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-notion-text">
          HooneyLog
        </h1>
        <p className="mt-1.5 text-[14px] sm:text-[15px] text-notion-secondary">
          {AUTHOR.tagline}의 개발 기록
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
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
          {searchValue && (
            <p className="mt-2 text-[13px] text-notion-secondary" role="status" aria-live="polite">
              검색 결과 {announcedCount}개
            </p>
          )}
          <div className="mt-8">
            <PostItemList posts={visiblePosts} viewsMap={viewsMap} query={searchValue} onReset={handleReset} />
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-5 py-2.5 text-[14px] rounded-[6px] border border-notion-border text-notion-text hover:bg-notion-hover active:bg-notion-hover active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
                >
                  더 보기 ({filteredPosts.length - visibleCount}개 남음)
                </button>
              </div>
            )}
            <p className="sr-only" role="status" aria-live="polite">
              {loadMoreAnnouncement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
