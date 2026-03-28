'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

/**
 * 💡 업계 표준: 조회수 카운터 (Optimistic UI & StrictMode 대응)
 * 페이지 로드 직후 API를 한 번만 호출하여 조회수를 올리고, 결과를 UI에 즉시 반영합니다.
 */
export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    // 개발 환경에서는 조회수가 불필요하게 올라가는 것을 방지할 수도 있습니다.
    // if (process.env.NODE_ENV !== 'production') return;

    const increment = async () => {
      try {
        const res = await fetch(`/api/views/${slug}`, {
          method: 'POST',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (typeof data.views === 'number') {
            setViews(data.views);
          }
        }
      } catch (error) {
        console.error('❌ Failed to increment view:', error);
        // 에러 발생 시 초기 조회수를 유지합니다.
      }
    };

    increment();
  }, [slug]);

  return (
    <div className="flex items-center gap-1 text-notion-secondary font-mono">
      <Eye className="w-3.5 h-3.5" />
      <span>{views.toLocaleString()}</span>
    </div>
  );
}
