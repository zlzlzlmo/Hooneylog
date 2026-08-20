'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Route-level error boundary. Catches render/data errors below the root layout
 * so a single failing post never blanks the whole site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel captures console output; the digest is what maps back to the server log.
    console.error('Route error:', error.digest ?? '', error);
  }, [error]);

  return (
    <div className="w-full flex items-center justify-center py-40">
      <section className="flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-notion-text text-center">
          문제가 발생했습니다.
        </h1>
        <p className="text-notion-secondary text-center">
          잠시 후 다시 시도해 주세요. 계속되면 홈에서 다른 글을 확인해 보세요.
        </p>
        {error.digest && (
          <p className="font-mono text-[12px] text-notion-secondary">오류 코드: {error.digest}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-notion-blue-text text-white rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg border border-notion-border text-notion-text font-medium hover:bg-notion-hover transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}
