'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 12;
import { NotionPost } from '@hooneylog/shared-types';
import { useFilterPost } from '@/hooks/use-filter-post';
import { ALL, CategoryCount } from '@/utils/category';
import { Search } from '@/components/features/search';
import { Sidebar } from '@/components/layout/sidebar';
import { PostItemList } from '@/components/blocks/post-item-list';
import { AUTHOR, AUTHOR_SOCIALS } from '@/lib/author';

import { viewsService } from '@/services/views';

export function HomePageClient({
  initialPosts,
  stats: initialStats,
  viewsMap: initialViewsMap,
  initialCategory,
  initialSearch
}: {
  initialPosts: NotionPost[],
  stats: { total: number, today: number },
  viewsMap: Record<string, number>,
  initialCategory?: string,
  initialSearch?: string
}) {
  const router = useRouter();
  const [stats, setStats] = useState(initialStats);
  const [viewsMap, setViewsMap] = useState(initialViewsMap);

  const {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts
  } = useFilterPost(initialPosts, initialCategory, initialSearch);

  // The URL is the source of truth for the category. Header <Link>s and the
  // sidebar both write `?category=`; the client component isn't remounted on a
  // soft navigation, so re-seed the active category whenever the server hands us
  // a fresh `initialCategory` prop (otherwise the sticky useState goes stale).
  useEffect(() => {
    setCurrentActiveCategory(initialCategory ?? ALL);
  }, [initialCategory, setCurrentActiveCategory]);

  // Sidebar clicks: filter instantly (optimistic) AND reflect the choice in the
  // URL so it's shareable, survives refresh/back, and stays in sync with the
  // header nav. 전체 clears the param back to a clean "/".
  const handleCategoryChange = useCallback((name: string) => {
    setCurrentActiveCategory(name);
    router.replace(name === ALL ? '/' : `/?category=${encodeURIComponent(name)}`, { scroll: false });
  }, [router, setCurrentActiveCategory]);

  // initialPosts is stable for the page, so build the category index once.
  const categoryCount = useMemo(() => new CategoryCount(initialPosts), [initialPosts]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 검색어/카테고리가 바뀌면 페이지네이션을 처음부터. effect 대신 렌더 중 조정하는
  // React 권장 패턴이라 추가 렌더 한 번 없이 곧바로 새 값으로 그려져요.
  const filterKey = `${searchValue}\u0000${currentActiveCategory}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // 검색 결과 개수는 별도 상태로 디바운스해서, 스크린리더에 한 번만 알려줘요.
  const [announcedCount, setAnnouncedCount] = useState(filteredPosts.length);

  // 더 보기로 추가 로드했을 때 스크린리더에 알려줄 메시지예요.
  const [loadMoreAnnouncement, setLoadMoreAnnouncement] = useState('');

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
    handleCategoryChange(ALL);
  };

  // 💡 실시간 데이터 동기화 (ISR 캐시 우회)
  useEffect(() => {
    const syncViews = async () => {
      try {
        // 1. 전체 통계 가져오기
        const latestStats = await viewsService.getStats();

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
        <span className="font-mono text-[12.5px] text-notion-secondary tracking-[0.02em]">
          ~/hooneylog — {AUTHOR.tagline}의 개발 로그
        </span>
        <h1 className="mt-2 text-2xl sm:text-[2rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-notion-text text-balance">
          막힌 지점부터 <span className="text-accent">되짚는</span> 기술 기록.
        </h1>

        {/* Author profile — recruiter appeal */}
        <div className="mt-5 flex flex-col gap-3 border-t border-notion-border pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="font-mono text-[12.5px] leading-relaxed text-notion-secondary">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-notion-text">
                {AUTHOR.koreanName} {AUTHOR.name}
              </span>
              {AUTHOR.openToWork && (
                <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-accent px-1.5 py-0.5 text-[11px] text-accent">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  구직 중 · Open to work
                </span>
              )}
            </div>
            <p className="mt-1">{AUTHOR.role}</p>
          </div>
          <nav aria-label="프로필 링크" className="flex flex-wrap items-center gap-1.5">
            {AUTHOR_SOCIALS.map(({ label, href }) => {
              const external = href.startsWith('http');
              return (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="rounded-[3px] border border-notion-border px-2.5 py-1 font-mono text-[12px] text-notion-secondary no-underline transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Sidebar for Categories */}
        <Sidebar
          categories={categoryCount.orderedListByDescendingCount}
          currentActiveCategory={currentActiveCategory}
          handleCurrentActiveCategory={handleCategoryChange}
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
