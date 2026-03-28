import { BaseApiService } from './base';

export interface GlobalStats {
  total: number;
  today: number;
}

/**
 * 💡 Client-side Views Service
 * BaseApiService를 상속받아 일관된 통신 인터페이스를 제공하며 코드 중복을 최소화합니다.
 */
class ViewsService extends BaseApiService {
  /**
   * 블로그 전체 통계 조회 (increment가 true면 방문 수 1 증가)
   */
  async getStats(options: { increment?: boolean } = {}): Promise<GlobalStats> {
    const path = '/api/views/stats';
    try {
      return options.increment 
        ? await this.post<GlobalStats>(path) 
        : await this.get<GlobalStats>(path);
    } catch (error) {
      console.error('❌ [Service] Failed to get stats:', error);
      return { total: 0, today: 0 };
    }
  }

  /**
   * 여러 포스트의 조회수 동시 조회
   */
  async getMultipleCounts(slugs: string[]): Promise<Record<string, number>> {
    if (!slugs || slugs.length === 0) return {};
    
    try {
      return await this.get<Record<string, number>>(`/api/views?slugs=${slugs.join(',')}`);
    } catch (error) {
      console.error('❌ [Service] Failed to get multiple counts:', error);
      return {};
    }
  }

  /**
   * 특정 포스트의 조회수 1 증가
   */
  async incrementPostView(slug: string): Promise<number | null> {
    if (!slug) return null;
    
    try {
      const data = await this.post<{ views: number }>(`/api/views/${slug}`);
      return data.views;
    } catch (error) {
      console.error(`❌ [Service] Failed to increment view for ${slug}:`, error);
      return null;
    }
  }

  /**
   * 특정 포스트의 현재 조회수 조회
   */
  async getPostView(slug: string): Promise<number> {
    if (!slug) return 0;
    
    try {
      const data = await this.get<{ views: number }>(`/api/views/${slug}`);
      return data.views;
    } catch (error) {
      console.error(`❌ [Service] Failed to get view for ${slug}:`, error);
      return 0;
    }
  }
}

// 💡 Singleton으로 내보내어 인스턴스를 하나만 생성하도록 관리합니다.
export const viewsService = new ViewsService();
