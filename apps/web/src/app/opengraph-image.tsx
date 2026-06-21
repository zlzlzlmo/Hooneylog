import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HooneyLog';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#191919',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: '#0F7B6C',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ color: '#fff', fontSize: '56px', fontWeight: 700 }}>HooneyLog</div>
        </div>
        <div style={{ color: '#9b9b9b', fontSize: '28px', marginTop: '24px' }}>
          기록과 함께 성장하는 풀스택 개발자
        </div>
      </div>
    ),
    { ...size }
  );
}
