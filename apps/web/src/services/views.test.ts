import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { viewsService } from './views';

// Global fetch mock
global.fetch = vi.fn();

describe('ViewsService (inherited from BaseApiService)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('calls GET /api/views/stats by default', async () => {
      const mockStats = { total: 100, today: 10 };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      const result = await viewsService.getStats();

      expect(global.fetch).toHaveBeenCalledWith('/api/views/stats', expect.objectContaining({
        method: 'GET'
      }));
      expect(result).toEqual(mockStats);
    });

    it('calls POST /api/views/stats when increment is true', async () => {
      const mockStats = { total: 101, today: 11 };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      const result = await viewsService.getStats({ increment: true });

      expect(global.fetch).toHaveBeenCalledWith('/api/views/stats', expect.objectContaining({
        method: 'POST'
      }));
      expect(result).toEqual(mockStats);
    });
  });

  describe('getMultipleCounts', () => {
    it('calls GET /api/views with slugs in query params', async () => {
      const mockViews = { 'post-1': 10, 'post-2': 20 };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockViews,
      });

      const result = await viewsService.getMultipleCounts(['post-1', 'post-2']);

      expect(global.fetch).toHaveBeenCalledWith('/api/views?slugs=post-1,post-2', expect.objectContaining({
        method: 'GET'
      }));
      expect(result).toEqual(mockViews);
    });
  });

  describe('incrementPostView', () => {
    it('calls POST /api/views/:slug', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ views: 42 }),
      });

      const result = await viewsService.incrementPostView('test-post');

      expect(global.fetch).toHaveBeenCalledWith('/api/views/test-post', expect.objectContaining({
        method: 'POST'
      }));
      expect(result).toBe(42);
    });
  });

  describe('BaseApiService generic error handling', () => {
    it('throws error and catches it when API returns non-ok status', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Database failure' }),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await viewsService.getPostView('error-slug');

      expect(result).toBe(0); // Error caught in ViewsService and returns fallback
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
