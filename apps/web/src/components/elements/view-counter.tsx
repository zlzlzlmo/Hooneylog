'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { viewsService } from '@/services/views';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

/**
 * 💡 업계 표준: 조회수 카운터 (Optimistic UI & StrictMode 대응)
 * 서비스 레이어를 통해 API를 호출하고 조회수를 동기화합니다.
 */
export function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    const increment = async () => {
      const newCount = await viewsService.incrementPostView(slug);
      if (newCount !== null) {
        setViews(newCount);
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
