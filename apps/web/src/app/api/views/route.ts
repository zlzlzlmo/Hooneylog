import { NextRequest, NextResponse } from 'next/server';
import { getViewCounts } from '@/lib/views';

// Bound how many keys a single request can fan out into an MGET, and only accept
// slugs shaped like Notion page ids (hex + dashes) so a caller can't turn the
// endpoint into an arbitrary-size KV amplifier.
const MAX_SLUGS = 200;
const SLUG_PATTERN = /^[a-zA-Z0-9-]{1,128}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsStr = searchParams.get('slugs');

  if (!slugsStr) {
    return NextResponse.json({ error: 'Missing slugs' }, { status: 400 });
  }

  const requested = Array.from(
    new Set(slugsStr.split(',').map((s) => s.trim()).filter(Boolean))
  ).filter((s) => SLUG_PATTERN.test(s));

  if (requested.length === 0) {
    return NextResponse.json({ error: 'No valid slugs' }, { status: 400 });
  }

  if (requested.length > MAX_SLUGS) {
    console.warn(`[API] /api/views truncated ${requested.length} slugs to ${MAX_SLUGS}`);
  }
  const slugs = requested.slice(0, MAX_SLUGS);

  try {
    const viewsMap = await getViewCounts(slugs);
    return NextResponse.json(viewsMap);
  } catch (error) {
    console.error('❌ [API] Failed to get multiple view counts:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
