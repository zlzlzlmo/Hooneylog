import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revalidateTag } from 'next/cache';
import { POST } from './route';
import { POSTS_TAG, POST_BLOCKS_TAG } from '@/lib/cache-tags';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

function makeRequest(secret?: string) {
  const headers = new Headers();
  if (secret !== undefined) headers.set('x-revalidate-secret', secret);
  return new Request('http://localhost/api/revalidate', { method: 'POST', headers });
}

function makeQueryRequest(secret: string) {
  const url = `http://localhost/api/revalidate?secret=${encodeURIComponent(secret)}`;
  return new Request(url, { method: 'POST' });
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVALIDATE_SECRET = 'top-secret';
  });

  it('revalidates the post tags when the secret matches', async () => {
    const res = await POST(makeRequest('top-secret'));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ revalidated: true });
    expect(revalidateTag).toHaveBeenCalledWith(POSTS_TAG, 'max');
    expect(revalidateTag).toHaveBeenCalledWith(POST_BLOCKS_TAG, 'max');
  });

  it('rejects with 401 and does not revalidate when the secret is wrong', async () => {
    const res = await POST(makeRequest('wrong'));

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects with 401 when no secret header is provided', async () => {
    const res = await POST(makeRequest());

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('revalidates when the secret is provided as a ?secret= query parameter', async () => {
    const res = await POST(makeQueryRequest('top-secret'));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ revalidated: true });
    expect(revalidateTag).toHaveBeenCalledWith(POSTS_TAG, 'max');
    expect(revalidateTag).toHaveBeenCalledWith(POST_BLOCKS_TAG, 'max');
  });

  it('rejects with 401 when the query secret is wrong', async () => {
    const res = await POST(makeQueryRequest('wrong'));

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('returns 500 when the server secret is not configured', async () => {
    delete process.env.REVALIDATE_SECRET;

    const res = await POST(makeRequest('top-secret'));

    expect(res.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
