'use client';

import Giscus from '@giscus/react';
import { useComment } from './comment-context';

export function GiscusComment() {
  const { repo, repoId, category, categoryId, theme, lang } = useComment();

  // repoId와 categoryId가 없으면 렌더링하지 않음 (설정 대기 상태)
  if (!repoId || !categoryId) {
    return (
      <div className="py-10 text-center text-notion-secondary text-[14px] bg-notion-gray-bg/30 rounded-lg border border-notion-border border-dashed">
        <p>Giscus 설정이 필요합니다.</p>
        <p className="mt-1 text-[12px]">.env 파일에 NEXT_PUBLIC_GISCUS_REPO_ID와 NEXT_PUBLIC_GISCUS_CATEGORY_ID를 설정해주세요.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 py-8 border-t border-notion-border">
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
