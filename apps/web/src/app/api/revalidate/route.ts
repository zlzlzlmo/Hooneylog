import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { POSTS_TAG, POST_BLOCKS_TAG } from '@/lib/cache-tags';

/**
 * On-demand revalidation endpoint.
 *
 * Lets an external trigger (e.g. a Notion automation/webhook) flush the
 * Notion Data Cache the moment content changes, instead of waiting for the
 * time-based revalidation window. Secured with a shared secret.
 *
 *   POST /api/revalidate   header: x-revalidate-secret: <REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Revalidation secret is not configured.' },
      { status: 500 }
    );
  }

  if (request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid revalidation secret.' },
      { status: 401 }
    );
  }

  // Next 16 requires a cache-life profile as the second argument; 'max'
  // invalidates every entry carrying the tag regardless of its lifetime.
  revalidateTag(POSTS_TAG, 'max');
  revalidateTag(POST_BLOCKS_TAG, 'max');

  return NextResponse.json({ revalidated: true });
}
