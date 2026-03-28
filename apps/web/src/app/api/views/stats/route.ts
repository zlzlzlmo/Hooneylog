import { NextResponse } from 'next/server';
import { getGlobalStats, incrementGlobalStats } from '@/lib/views';

export async function GET() {
  try {
    const stats = await getGlobalStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ [API] Failed to get stats:', error);
    return NextResponse.json({ total: 0, today: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    const stats = await incrementGlobalStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ [API] Failed to increment stats:', error);
    return NextResponse.json({ total: 0, today: 0 }, { status: 500 });
  }
}
