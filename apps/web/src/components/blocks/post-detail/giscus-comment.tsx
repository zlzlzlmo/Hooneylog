'use client';

import Giscus from '@giscus/react';

interface GiscusCommentProps {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  theme?: string;
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
  theme = 'light',
  lang = 'ko',
}: GiscusCommentProps = {}) {
  // repoId와 categoryId가 없으면 렌더링하지 않음 (설정 대기 상태)
  if (!repoId || !categoryId) {
    return (
      <div className="py-10 text-center text-notion-secondary text-[14px] bg-notion-gray-bg/40 rounded-[4px] border border-dashed border-notion-border">
        <p>Giscus 설정이 필요합니다.</p>
        <p className="mt-2 text-[12px] font-mono text-notion-secondary/80">.env 파일에 NEXT_PUBLIC_GISCUS_REPO_ID와 NEXT_PUBLIC_GISCUS_CATEGORY_ID를 설정해주세요.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-notion-border">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.12em] text-notion-secondary">
        <span className="text-accent">{'//'}</span> Comments
      </p>
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
