'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary: replaces the root layout itself, so it must ship its own
 * <html>/<body>. Only reached when the layout (or a provider inside it) throws.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('Root layout error:', error.digest ?? '', error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#ffffff',
          color: '#37352f',
        }}
      >
        <main style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            페이지를 불러오지 못했습니다.
          </h1>
          <p style={{ color: '#787774', marginBottom: '1.5rem' }}>
            새로고침하거나 잠시 후 다시 방문해 주세요.
          </p>
          {/* Client-side nav would reuse the broken tree; force a fresh document. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              background: '#2383e2',
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            홈으로 돌아가기
          </a>
        </main>
      </body>
    </html>
  );
}
