import { NextRequest, NextResponse } from 'next/server';
import { getViewCounts } from '@/lib/views';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsStr = searchParams.get('slugs');
  
  if (!slugsStr) {
    return NextResponse.json({ error: 'Missing slugs' }, { status: 400 });
  }

  const slugs = slugsStr.split(',');

  try {
    const viewsMap = await getViewCounts(slugs);
    return NextResponse.json(viewsMap);
  } catch (error) {
    console.error('❌ [API] Failed to get multiple view counts:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
