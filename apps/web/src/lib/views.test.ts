import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { kv } from '@vercel/kv';
import { incrementView, getGlobalStats, getViewCount, getViewCounts, incrementGlobalStats, markViewedOnce } from './views';

// Mock the @vercel/kv module
vi.mock('@vercel/kv', () => ({
  kv: {
    pipeline: vi.fn(),
    mget: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('views utility', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Suppress expected errors in console
    
    // Mock standard pipeline behavior
    const mockPipeline = {
      incr: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn().mockResolvedValue([10, 100, 5]),
    };
    (kv.pipeline as Mock).mockReturnValue(mockPipeline);
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('incrementGlobalStats', () => {
    it('successfully increments global total and today views', async () => {
      const result = await incrementGlobalStats();
      
      expect(kv.pipeline).toHaveBeenCalled();
      
      const pipeline = kv.pipeline();
      expect(pipeline.incr).toHaveBeenCalledWith('views:total');
      
      const today = new Date().toISOString().split('T')[0];
      expect(pipeline.incr).toHaveBeenCalledWith(`views:today:${today}`);
      expect(pipeline.expire).toHaveBeenCalledWith(`views:today:${today}`, 172800);
      expect(pipeline.exec).toHaveBeenCalled();
      
      expect(result).toEqual({ total: 10, today: 100 });
    });

    it('returns default values on error', async () => {
      const mockPipeline = {
        incr: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockRejectedValue(new Error('Global increment failed')),
      };
      (kv.pipeline as Mock).mockReturnValue(mockPipeline);

      const result = await incrementGlobalStats();
      
      expect(result).toEqual({ total: 0, today: 0 });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('incrementView', () => {
    it('successfully increments views using pipeline', async () => {
      const result = await incrementView('test-post');
      
      expect(kv.pipeline).toHaveBeenCalled();
      
      const pipeline = kv.pipeline();
      expect(pipeline.incr).toHaveBeenCalledWith('views:post:test-post');
      expect(pipeline.incr).toHaveBeenCalledWith('views:total');
      
      const today = new Date().toISOString().split('T')[0];
      expect(pipeline.incr).toHaveBeenCalledWith(`views:today:${today}`);
      expect(pipeline.expire).toHaveBeenCalledWith(`views:today:${today}`, 172800); // 60 * 60 * 48
      expect(pipeline.exec).toHaveBeenCalled();
      
      // Should return the first result (post view count)
      expect(result).toBe(10);
    });

    it('returns 0 and logs error if pipeline execution fails', async () => {
      const mockPipeline = {
        incr: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
      };
      (kv.pipeline as Mock).mockReturnValue(mockPipeline);

      const result = await incrementView('test-post');
      
      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ [KV] Failed to increment views for test-post'),
        expect.any(Error)
      );
    });
  });

  describe('getGlobalStats', () => {
    it('fetches total and today stats successfully', async () => {
      (kv.mget as Mock).mockResolvedValue([5000, 150]);

      const result = await getGlobalStats();

      const today = new Date().toISOString().split('T')[0];
      expect(kv.mget).toHaveBeenCalledWith('views:total', `views:today:${today}`);
      expect(result).toEqual({ total: 5000, today: 150 });
    });

    it('handles null values correctly', async () => {
      (kv.mget as Mock).mockResolvedValue([null, null]);

      const result = await getGlobalStats();

      expect(result).toEqual({ total: 0, today: 0 });
    });

    it('returns default stats on error', async () => {
      (kv.mget as Mock).mockRejectedValue(new Error('Redis down'));

      const result = await getGlobalStats();

      expect(result).toEqual({ total: 0, today: 0 });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getViewCount', () => {
    it('returns the view count for a specific post', async () => {
      (kv.get as Mock).mockResolvedValue(42);

      const result = await getViewCount('test-post');

      expect(kv.get).toHaveBeenCalledWith('views:post:test-post');
      expect(result).toBe(42);
    });

    it('returns 0 if view count is null', async () => {
      (kv.get as Mock).mockResolvedValue(null);

      const result = await getViewCount('test-post');

      expect(result).toBe(0);
    });

    it('returns 0 on error', async () => {
      (kv.get as Mock).mockRejectedValue(new Error('Redis timeout'));

      const result = await getViewCount('error-post');

      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getViewCounts', () => {
    it('returns an empty object if no slugs provided', async () => {
      const result = await getViewCounts([]);
      expect(result).toEqual({});
      expect(kv.mget).not.toHaveBeenCalled();
    });

    it('fetches and maps view counts for multiple posts', async () => {
      const slugs = ['post-1', 'post-2', 'post-3'];
      (kv.mget as Mock).mockResolvedValue([100, null, 300]);

      const result = await getViewCounts(slugs);

      expect(kv.mget).toHaveBeenCalledWith('views:post:post-1', 'views:post:post-2', 'views:post:post-3');
      expect(result).toEqual({
        'post-1': 100,
        'post-2': 0, // Fallback for null
        'post-3': 300,
      });
    });

    it('returns an empty object on error', async () => {
      (kv.mget as Mock).mockRejectedValue(new Error('Batch error'));

      const result = await getViewCounts(['post-1', 'post-2']);

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('markViewedOnce', () => {
    it('returns true when the seen-key is newly set (NX success)', async () => {
      (kv.set as Mock).mockResolvedValue('OK');

      const result = await markViewedOnce('test-post', 'abc123');

      expect(result).toBe(true);
    });

    it('returns false when the seen-key already exists (NX returns null)', async () => {
      (kv.set as Mock).mockResolvedValue(null);

      const result = await markViewedOnce('test-post', 'abc123');

      expect(result).toBe(false);
    });

    it('uses a per-slug-per-iphash key with nx and a TTL', async () => {
      (kv.set as Mock).mockResolvedValue('OK');

      await markViewedOnce('test-post', 'abc123', 3600);

      expect(kv.set).toHaveBeenCalledWith(
        'views:seen:test-post:abc123',
        1,
        { nx: true, ex: 3600 }
      );
    });

    it('defaults to a 24h TTL', async () => {
      (kv.set as Mock).mockResolvedValue('OK');

      await markViewedOnce('test-post', 'abc123');

      expect(kv.set).toHaveBeenCalledWith(
        'views:seen:test-post:abc123',
        1,
        { nx: true, ex: 86400 }
      );
    });

    it('fails open (returns true) and logs on KV error', async () => {
      (kv.set as Mock).mockRejectedValue(new Error('Redis down'));

      const result = await markViewedOnce('test-post', 'abc123');

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
