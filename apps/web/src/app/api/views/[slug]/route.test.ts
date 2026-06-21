import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from './route';
import { incrementView, getViewCount, markViewedOnce } from '@/lib/views';
import { getClientIp, hashIp } from '@/lib/view-guard';

vi.mock('@/lib/views', () => ({
  incrementView: vi.fn(),
  getViewCount: vi.fn(),
  markViewedOnce: vi.fn(),
}));

vi.mock('@/lib/view-guard', () => ({
  getClientIp: vi.fn(() => '1.2.3.4'),
  hashIp: vi.fn(() => 'hashed-ip'),
}));

function makeRequest(): NextRequest {
  return { headers: new Headers({ 'x-forwarded-for': '1.2.3.4' }) } as unknown as NextRequest;
}

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe('POST /api/views/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments on a first (non-duplicate) visit', async () => {
    (markViewedOnce as Mock).mockResolvedValue(true);
    (incrementView as Mock).mockResolvedValue(5);

    const res = await POST(makeRequest(), makeContext('test-post'));
    const body = await res.json();

    expect(incrementView).toHaveBeenCalledWith('test-post');
    expect(getViewCount).not.toHaveBeenCalled();
    expect(body).toEqual({ views: 5, counted: true });
  });

  it('does not increment on a duplicate visit, returns current count', async () => {
    (markViewedOnce as Mock).mockResolvedValue(false);
    (getViewCount as Mock).mockResolvedValue(42);

    const res = await POST(makeRequest(), makeContext('test-post'));
    const body = await res.json();

    expect(incrementView).not.toHaveBeenCalled();
    expect(getViewCount).toHaveBeenCalledWith('test-post');
    expect(body).toEqual({ views: 42, counted: false });
  });

  it('dedups using the hashed client IP', async () => {
    (markViewedOnce as Mock).mockResolvedValue(true);
    (incrementView as Mock).mockResolvedValue(1);

    await POST(makeRequest(), makeContext('test-post'));

    expect(getClientIp).toHaveBeenCalled();
    expect(hashIp).toHaveBeenCalledWith('1.2.3.4');
    expect(markViewedOnce).toHaveBeenCalledWith('test-post', 'hashed-ip');
  });
});
