import { kv } from '@vercel/kv';

/**
 * 💡 업계 표준 조회수 관리 유틸리티 (고성능 파이프라인 방식)
 */

export async function incrementGlobalStats(): Promise<{ total: number; today: number }> {
  const totalKey = 'views:total';
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `views:today:${today}`;
  
  try {
    const pipeline = kv.pipeline();
    pipeline.incr(totalKey);
    pipeline.incr(todayKey);
    pipeline.expire(todayKey, 60 * 60 * 48);
    
    const results = await pipeline.exec();
    
    return {
      total: (results[0] as number) ?? 0,
      today: (results[1] as number) ?? 0
    };
  } catch (error) {
    console.error('❌ [KV] Failed to increment global stats:', error);
    return { total: 0, today: 0 };
  }
}

export async function incrementView(slug: string): Promise<number> {
  const postKey = `views:post:${slug}`;
  const totalKey = 'views:total';
  
  // 오늘 날짜 키 생성 (예: views:today:2024-03-28)
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `views:today:${today}`;
  
  try {
    // 💡 Redis Pipeline: 한 번의 네트워크 요청으로 3가지 작업을 동시에 처리
    const pipeline = kv.pipeline();
    pipeline.incr(postKey);  // 포스트 개별 조회수
    pipeline.incr(totalKey); // 블로그 전체 누적 조회수
    pipeline.incr(todayKey); // 오늘 하루 전체 조회수
    
    // 오늘 키는 48시간 뒤 자동 삭제 (메모리 절약)
    pipeline.expire(todayKey, 60 * 60 * 48);
    
    const results = await pipeline.exec();
    
    // 첫 번째 결과(포스트 조회수) 반환
    return (results[0] as number) ?? 0;
  } catch (error) {
    console.error(`❌ [KV] Failed to increment views for ${slug}:`, error);
    return 0;
  }
}

/**
 * 사이드바용 글로벌 통계 데이터 가져오기
 */
export async function getGlobalStats() {
  const totalKey = 'views:total';
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `views:today:${today}`;
  
  try {
    const [total, todayCount] = await kv.mget<number[]>(totalKey, todayKey);
    return {
      total: total ?? 0,
      today: todayCount ?? 0
    };
  } catch (error) {
    console.error('❌ [KV] Failed to get global stats:', error);
    return { total: 0, today: 0 };
  }
}

export async function getViewCount(slug: string): Promise<number> {
  const key = `views:post:${slug}`;
  try {
    const count = await kv.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error(`❌ [KV] Failed to get view count for ${slug}:`, error);
    return 0;
  }
}

export async function getViewCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  
  const keys = slugs.map(slug => `views:post:${slug}`);
  try {
    const counts = await kv.mget<number[]>(...keys);
    
    return slugs.reduce((acc, slug, index) => {
      acc[slug] = counts[index] ?? 0;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('❌ [KV] Failed to get multiple view counts:', error);
    return {};
  }
}
