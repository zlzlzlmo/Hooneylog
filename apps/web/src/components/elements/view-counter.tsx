'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Eye } from 'lucide-react';
import { viewsService } from '@/services/views';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

/**
 * 💡 업계 표준: 조회수 카운터 (어뷰징 방지 및 Optimistic UI)
 * 1. UI 깜빡임 방지: useLayoutEffect를 사용하여 화면에 그리기 전에 세션 스토리지 기반으로 즉시 +1을 적용해 깜빡임을 최소화합니다.
 * 2. StrictMode 대응: useRef를 이용한 중복 호출 방지
 * 3. 새로고침 어뷰징 방지: sessionStorage를 활용하여 한 세션(탭) 내에서는 한 번만 카운팅
 */
export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const hasAttempted = useRef(false);

  // 화면에 Paint 되기 전에 동기적으로 실행되어 +1을 미리 반영 (깜빡임 방지)
  useLayoutEffect(() => {
    try {
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
      if (!viewedPosts.includes(slug)) {
        // 읽지 않은 글이면 화면에 미리 +1을 반영 (진짜 서버 증가는 useEffect에서 비동기로 처리)
        setViews(initialViews + 1);
      }
    } catch {
      // ignore SSR/parsing errors
    }
  }, [slug, initialViews]);

  useEffect(() => {
    // 1. Strict Mode 중복 실행 방지
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const manageViewCount = async () => {
      try {
        // 2. sessionStorage를 이용한 중복 조회수 증가 방지 (어뷰징 차단)
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
        
        if (viewedPosts.includes(slug)) {
          // 이미 이번 세션에 읽은 글이라면, 증가시키지 않고 서버의 최신 조회수만 가져옵니다.
          const currentCount = await viewsService.getPostView(slug);
          if (currentCount > 0) setViews(currentCount);
          return;
        }

        // 3. 읽지 않은 글이라면 API를 호출하여 조회수를 실제로 증가시킵니다.
        const newCount = await viewsService.incrementPostView(slug);
        if (newCount !== null) {
          setViews(newCount);
          
          // 성공적으로 증가했다면 세션스토리지에 기록합니다.
          viewedPosts.push(slug);
          sessionStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
        } else {
           // API 실패 시 원래 값으로 롤백
           setViews(initialViews);
        }
      } catch (error) {
        console.error('❌ Failed to manage view count:', error);
        setViews(initialViews); // 에러 시 롤백
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
