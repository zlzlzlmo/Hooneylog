'use client';

import { useSyncExternalStore } from 'react';
import Giscus from '@giscus/react';

import { Separator } from '@/components/ui/separator';
import { subscribeToTheme } from '@/lib/theme';

interface GiscusCommentProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  lang?: string;
}

// The giscus config is a handful of static env-backed constants, so read them
// directly here (with sensible fallbacks) instead of threading them through a
// single-consumer React context.
export function GiscusComment({
  repo = process.env.NEXT_PUBLIC_GISCUS_REPO || 'zlzlzlmo/Hooneylog',
  repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDORy83hA',
  category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General',
  categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDORy83hM4C5hoe',
  lang = 'ko',
}: GiscusCommentProps = {}) {
  // giscus renders in an iframe, so it can't inherit the page theme — feed it the
  // resolved <html class="dark"> state and let it re-render when that flips.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'light',
  );

  // repoId와 categoryId가 없으면 렌더링하지 않음 (설정 대기 상태)
  if (!repoId || !categoryId) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        <p>Giscus 설정이 필요합니다.</p>
        <p className="mt-2 text-xs">
          .env 파일에 NEXT_PUBLIC_GISCUS_REPO_ID와 NEXT_PUBLIC_GISCUS_CATEGORY_ID를 설정해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <Separator className="mb-8" />
      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">댓글</h2>
      <Giscus
        repo={`${repo as `${string}/${string}`}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme}
        lang={lang}
        loading="lazy"
      />
    </div>
  );
}
