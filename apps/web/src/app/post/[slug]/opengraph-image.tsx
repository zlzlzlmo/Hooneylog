import { ImageResponse } from 'next/og';
import { getPostById } from '@/lib/notion';
import { loadNotoSansKrBold } from '../../_og/font';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HooneyLog post';

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostById(slug);
  const title = post?.title ?? 'HooneyLog';
  const category = post?.category ?? '';

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
        <div style={{ color: '#fff', fontSize: '60px', fontWeight: 700, lineHeight: 1.2, display: 'flex' }}>
          {title}
        </div>
        <div style={{ color: '#9b9b9b', fontSize: '26px' }}>hooneylog.com</div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Noto Sans KR', data: loadNotoSansKrBold(), weight: 700 as const, style: 'normal' as const }],
    }
  );
}
