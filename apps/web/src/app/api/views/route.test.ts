import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET } from './route';
import { getViewCounts } from '@/lib/views';

vi.mock('@/lib/views', () => ({
  getViewCounts: vi.fn(async (slugs: string[]) =>
    Object.fromEntries(slugs.map((s) => [s, 1]))
  ),
}));

function req(query: string): NextRequest {
  return { url: `http://localhost/api/views?${query}` } as unknown as NextRequest;
}

describe('GET /api/views', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns view counts for valid slugs', async () => {
    const res = await GET(req('slugs=post-a,post-b'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ 'post-a': 1, 'post-b': 1 });
    expect(getViewCounts).toHaveBeenCalledWith(['post-a', 'post-b']);
  });

  it('drops malformed slugs before querying KV', async () => {
    await GET(req('slugs=' + encodeURIComponent('good-1,bad slug,../../etc,ok2')));
    expect(getViewCounts as Mock).toHaveBeenCalledWith(['good-1', 'ok2']);
  });

  it('caps the number of slugs to bound MGET amplification', async () => {
    const many = Array.from({ length: 250 }, (_, i) => `p${i}`).join(',');
    await GET(req('slugs=' + many));
    const passed = (getViewCounts as Mock).mock.calls[0]?.[0] as string[];
    expect(passed.length).toBe(200);
  });

  it('returns 400 when no valid slugs remain', async () => {
    const res = await GET(req('slugs=' + encodeURIComponent('bad slug,../x')));
    expect(res.status).toBe(400);
    expect(getViewCounts).not.toHaveBeenCalled();
  });

  it('returns 400 when the slugs param is missing', async () => {
    const res = await GET(req(''));
    expect(res.status).toBe(400);
  });
});
