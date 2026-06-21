import { NextRequest, NextResponse } from 'next/server';
import { incrementView, getViewCount, markViewedOnce } from '@/lib/views';
import { getClientIp, hashIp } from '@/lib/view-guard';

/**
 * 💡 업계 표준: 조회수 조회 API
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const count = await getViewCount(slug);
    return NextResponse.json({ views: count });
  } catch (error) {
    console.error(`❌ [API] Failed to get views for ${slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * 💡 업계 표준: 조회수 증가 API
 * 클라이언트에서 호출하여 ISR 캐시와 상관없이 실시간 조회를 기록합니다.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    // 💡 서버측 어뷰징 방어: 같은 (해시 IP, slug) 조합은 24h 동안 1회만 집계
    const ipHash = hashIp(getClientIp(request.headers));
    const first = await markViewedOnce(slug, ipHash);

    const views = first ? await incrementView(slug) : await getViewCount(slug);

    return NextResponse.json({ views, counted: first });
  } catch (error) {
    console.error('❌ [API] Failed to increment views:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
