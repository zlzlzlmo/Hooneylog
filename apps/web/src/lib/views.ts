import { kv } from '@vercel/kv';

/**
 * 💡 업계 표준 조회수 관리 유틸리티
 * Redis의 원자적 연산(INCR)을 사용하여 초당 수만 건의 요청도 안전하게 처리합니다.
 */

// 개발 환경에서는 조회수가 너무 많이 올라가는 것을 방지하기 위해 
// 실제 증가 로직을 선택적으로 비활성화할 수도 있습니다.
const IS_PROD = process.env.NODE_ENV === 'production';

export async function incrementView(slug: string): Promise<number> {
  // views:포스트ID 형식의 키 사용
  const key = `views:${slug}`;
  
  try {
    // 💡 Redis INCR 명령어로 1 증가시키고 새로운 값을 즉시 반환
    const newCount = await kv.incr(key);
    return newCount;
  } catch (error) {
    console.error(`❌ [KV] Failed to increment views for ${slug}:`, error);
    // 에러 시 0 반환 (서비스는 계속 작동해야 함)
    return 0;
  }
}

export async function getViewCount(slug: string): Promise<number> {
  const key = `views:${slug}`;
  try {
    const count = await kv.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error(`❌ [KV] Failed to get view count for ${slug}:`, error);
    return 0;
  }
}

/**
 * 모든 포스트의 조회수를 한 번에 가져오는 배치 유틸리티
 * 메인 리스트에서 각 포스트의 조회수를 보여줄 때 유용합니다.
 */
export async function getAllViewCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  
  try {
    const keys = slugs.map(slug => `views:${slug}`);
    // 💡 Redis MGET 명령어로 한 번의 네트워크 요청으로 모든 값 조회
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
