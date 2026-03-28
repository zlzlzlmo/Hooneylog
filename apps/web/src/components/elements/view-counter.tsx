'use client';

import { useEffect } from 'react';

/**
 * 💡 업계 표준: 보이지 않는 조회수 카운터
 * 페이지 로드 직후 API를 호출하여 조회수를 안전하게 올립니다.
 */
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // 개발 환경에서는 조회수가 불필요하게 올라가는 것을 방지할 수도 있습니다.
    // if (process.env.NODE_ENV !== 'production') return;

    const increment = async () => {
      try {
        await fetch(`/api/views/${slug}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('❌ Failed to increment view:', error);
      }
    };

    increment();
  }, [slug]);

  return null; // 화면에는 아무것도 그리지 않습니다.
}
