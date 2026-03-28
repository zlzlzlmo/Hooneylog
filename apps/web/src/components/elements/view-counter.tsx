'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { viewsService } from '@/services/views';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

/**
 * 💡 업계 표준: 조회수 카운터 (어뷰징 방지 및 Optimistic UI)
 * 1. StrictMode 대응: useRef를 이용한 중복 호출 방지
 * 2. 새로고침 어뷰징 방지: sessionStorage를 활용하여 한 세션(탭) 내에서는 한 번만 카운팅
 */
export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const hasAttempted = useRef(false);

  useEffect(() => {
    // 1. Strict Mode 중복 실행 방지
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const manageViewCount = async () => {
      try {
        // 2. sessionStorage를 이용한 중복 조회수 증가 방지 (어뷰징 차단)
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
        
        if (viewedPosts.includes(slug)) {
          // 이미 이번 세션에 읽은 글이라면, 증가시키지 않고 최신 조회수만 가져옵니다.
          const currentCount = await viewsService.getPostView(slug);
          if (currentCount > 0) setViews(currentCount);
          return;
        }

        // 3. 읽지 않은 글이라면 API를 호출하여 조회수를 증가시킵니다.
        const newCount = await viewsService.incrementPostView(slug);
        if (newCount !== null) {
          setViews(newCount);
          
          // 성공적으로 증가했다면 세션스토리지에 기록합니다.
          viewedPosts.push(slug);
          sessionStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
        }
      } catch (error) {
        console.error('❌ Failed to manage view count:', error);
      }
    };

    manageViewCount();
  }, [slug]);

  return (
    <div className="flex items-center gap-1 text-notion-secondary font-mono">
      <Eye className="w-3.5 h-3.5" />
      <span>{views.toLocaleString()}</span>
    </div>
  );
}
