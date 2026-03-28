import { NextRequest, NextResponse } from 'next/server';
import { incrementView } from '@/lib/views';

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
    // 💡 실제 KV 데이터 증가
    const newCount = await incrementView(slug);
    
    return NextResponse.json({ views: newCount });
  } catch (error) {
    console.error('❌ [API] Failed to increment views:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
