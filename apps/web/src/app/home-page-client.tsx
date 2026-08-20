'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { NotionPost } from '@hooneylog/shared-types';
import { Blog37, type Blog37Post } from '@/components/blog37';
import { useFilterPost } from '@/hooks/use-filter-post';
import { AUTHOR } from '@/lib/author';
import { ALL, CategoryCount } from '@/utils/category';
import { getCategoryImageSrc } from '@/utils/category-image';
import { formatDate } from '@/utils/date';
import { viewsService } from '@/services/views';

const PAGE_SIZE = 12;

export function HomePageClient({
  initialPosts,
  stats: initialStats,
  viewsMap: initialViewsMap,
  initialCategory,
  initialSearch,
}: {
  initialPosts: NotionPost[];
  stats: { total: number; today: number };
  viewsMap: Record<string, number>;
  initialCategory?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [stats, setStats] = useState(initialStats);
  const [viewsMap, setViewsMap] = useState(initialViewsMap);

  const {
    searchValue,
    currentActiveCategory,
    setSearchValue,
    setCurrentActiveCategory,
    filteredPosts,
  } = useFilterPost(initialPosts, initialCategory, initialSearch);

  // The URL is the source of truth for the category. Header links and the
  // sidebar both write `?category=`; the client component isn't remounted on a
  // soft navigation, so re-seed the active category whenever the server hands us
  // a fresh `initialCategory` prop (otherwise the sticky useState goes stale).
  useEffect(() => {
    setCurrentActiveCategory(initialCategory ?? ALL);
  }, [initialCategory, setCurrentActiveCategory]);

  // Sidebar clicks: filter instantly (optimistic) AND reflect the choice in the
  // URL so it is shareable, survives refresh/back, and stays in sync with the
  // header nav. ALL clears the param back to a clean "/".
  const handleCategoryChange = useCallback(
    (name: string) => {
      setCurrentActiveCategory(name);
      router.replace(name === ALL ? '/' : `/?category=${encodeURIComponent(name)}`, {
        scroll: false,
      });
    },
    [router, setCurrentActiveCategory],
  );

  // initialPosts is stable for the page, so build the category index once.
  const categoryCount = useMemo(() => new CategoryCount(initialPosts), [initialPosts]);
  const categories = useMemo(
    () =>
      categoryCount.orderedListByDescendingCount.map(([name, count]) => ({
        label: name,
        value: name,
        count,
      })),
    [categoryCount],
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 검색어/카테고리가 바뀌면 페이지네이션을 처음부터. effect 대신 렌더 중 조정하는
  // React 권장 패턴이라 추가 렌더 한 번 없이 곧바로 새 값으로 그려져요.
  const filterKey = `${searchValue}::${currentActiveCategory}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // 검색 결과 개수는 별도 상태로 디바운스해서, 스크린리더에 한 번만 알려줘요.
  const [announcedCount, setAnnouncedCount] = useState(filteredPosts.length);

  // 입력값은 즉시 필터링하되, 안내 문구만 약 200ms 디바운스해요.
  useEffect(() => {
    const id = setTimeout(() => {
      setAnnouncedCount(filteredPosts.length);
    }, 200);
    return () => clearTimeout(id);
  }, [filteredPosts.length]);

  const visiblePosts: Blog37Post[] = useMemo(
    () =>
      filteredPosts.slice(0, visibleCount).map((post) => {
        const image = getCategoryImageSrc(post.category, post.tags);
        return {
          id: post.id,
          title: post.title,
          summary: post.description,
          label: post.category || '미분류',
          published: formatDate(post.createdAt),
          url: `/post/${post.id}`,
          image,
          imageIsFallback: image === '/images/default.png',
          views: viewsMap[post.id] ?? 0,
        };
      }),
    [filteredPosts, visibleCount, viewsMap],
  );

  const handleLoadMore = () => setVisibleCount((count) => count + PAGE_SIZE);

  const handleReset = () => {
    setSearchValue('');
    handleCategoryChange(ALL);
  };

  // 실시간 조회수 동기화 (ISR 캐시 우회)
  useEffect(() => {
    const syncViews = async () => {
      try {
        const latestStats = await viewsService.getStats();
        const latestViews = await viewsService.getMultipleCounts(initialPosts.map((p) => p.id));

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
    <Blog37
      heading="막힌 지점부터 되짚는 기술 기록."
      description={AUTHOR.role}
      categories={categories}
      selectedCategory={currentActiveCategory}
      onSelectCategory={handleCategoryChange}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      posts={visiblePosts}
      resultCount={announcedCount}
      remaining={Math.max(0, filteredPosts.length - visibleCount)}
      onLoadMore={handleLoadMore}
      onReset={handleReset}
      stats={stats}
    />
  );
}
