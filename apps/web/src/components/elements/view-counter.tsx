'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { viewsService } from '@/services/views';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

/**
 * 💡 조회수 카운터 (Optimistic UI + 세션 기반 어뷰징 방지)
 * 1. Optimistic UI: 읽지 않은 글이면 즉시 화면에 +1을 반영하고, 서버 증가는 비동기로 처리합니다.
 * 2. 세션 중복 방지: sessionStorage로 한 세션(탭) 내 1회만 카운팅합니다.
 * 3. StrictMode/재실행 방지: 마지막으로 시도한 slug를 ref로 기억해 같은 글의 중복 호출은 막되,
 *    slug가 바뀌면(클라이언트 네비게이션) 다시 집계합니다.
 */
export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [trackedSlug, setTrackedSlug] = useState(slug);
  const attemptedSlug = useRef<string | null>(null);

  // App Router는 /post/[slug] 사이 이동 시 이 클라이언트 컴포넌트를 리마운트하지 않으므로,
  // slug가 바뀌면 렌더 중에 조회수 상태를 새 글 기준으로 리셋한다.
  if (slug !== trackedSlug) {
    setTrackedSlug(slug);
    setViews(initialViews);
  }

  useEffect(() => {
    // StrictMode 이중 실행 방지 — 단, slug가 바뀌면 다시 시도하도록 재무장한다.
    if (attemptedSlug.current === slug) return;
    attemptedSlug.current = slug;

    const manageViewCount = async () => {
      try {
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');

        if (viewedPosts.includes(slug)) {
          // 이번 세션에 이미 읽은 글: 증가 없이 서버 최신값만 반영(양수일 때만).
          const currentCount = await viewsService.getPostView(slug);
          if (currentCount > 0) setViews(currentCount);
          return;
        }

        // 읽지 않은 글: 화면에 먼저 +1(Optimistic).
        setViews(initialViews + 1);

        const newCount = await viewsService.incrementPostView(slug);
        // 양수인 실제 카운트만 신뢰한다. null(네트워크 실패)이나 0(KV 장애로 인한 가짜값)은
        // 건강한 카운트를 덮어쓰지 않으며 'viewed'로 기록하지도 않는다(다음 마운트에서 재시도).
        if (newCount !== null && newCount > 0) {
          setViews(newCount);
          viewedPosts.push(slug);
          sessionStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
        } else {
          setViews(initialViews);
        }
      } catch (error) {
        console.error('❌ Failed to manage view count:', error);
        setViews(initialViews);
      }
    };

    manageViewCount();
  }, [slug, initialViews]);

  return (
    <div className="flex items-center gap-1 text-notion-secondary font-mono">
      <Eye className="w-3.5 h-3.5" />
      <span>{views.toLocaleString()}</span>
    </div>
  );
}
