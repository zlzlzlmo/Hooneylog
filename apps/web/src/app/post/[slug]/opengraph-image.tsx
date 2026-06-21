import { ImageResponse } from 'next/og';
import { getPostById } from '@/lib/notion';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HooneyLog post';

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`;
    const css = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((r) => r.text());
    const match = css.match(/src:\s*url\((https:[^)]+)\)/);
    if (!match || !match[1]) return null;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostById(slug);
  const title = post?.title ?? 'HooneyLog';
  const category = post?.category ?? '';

  const fontData = await loadKoreanFont(title + category + '기록과 함께 성장하는 풀스택 개발자');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#191919',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#0F7B6C',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ color: '#9b9b9b', fontSize: '28px' }}>{category}</div>
        </div>
        {fontData ? (
          <div style={{ color: '#fff', fontSize: '60px', fontWeight: 700, lineHeight: 1.2, display: 'flex' }}>
            {title}
          </div>
        ) : (
          <div style={{ color: '#fff', fontSize: '56px', fontWeight: 700, display: 'flex' }}>HooneyLog</div>
        )}
        <div style={{ color: '#9b9b9b', fontSize: '26px' }}>hooneylog.com</div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Noto Sans KR', data: fontData, weight: 700 as const, style: 'normal' as const }] : [],
    }
  );
}
