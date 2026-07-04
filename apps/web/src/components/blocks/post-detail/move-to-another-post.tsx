import React from 'react';
import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';

interface MoveToAnotherPostProps {
  previousPost: NotionPost | null;
  nextPost: NotionPost | null;
}

export function MoveToAnotherPost({ previousPost, nextPost }: MoveToAnotherPostProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav
      aria-label="이전/다음 글"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-10 my-10 border-t border-b border-notion-border"
    >
      {previousPost ? (
        <Link
          href={`/post/${previousPost.id}`}
          className="group flex flex-col items-start p-4 rounded-[4px] border border-notion-border hover:bg-notion-hover transition-colors w-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
        >
          <span className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-notion-secondary mb-2">
            <span aria-hidden="true">&larr;</span> PREV
          </span>
          <span className="font-bold text-[16px] tracking-[-0.01em] text-notion-text group-hover:text-accent line-clamp-1 w-full text-left text-balance transition-colors">
            {previousPost.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {nextPost && (
        <Link
          href={`/post/${nextPost.id}`}
          className="group flex flex-col items-end p-4 rounded-[4px] border border-notion-border hover:bg-notion-hover transition-colors w-full text-right sm:col-start-2 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
        >
          <span className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-notion-secondary mb-2">
            NEXT <span aria-hidden="true">&rarr;</span>
          </span>
          <span className="font-bold text-[16px] tracking-[-0.01em] text-notion-text group-hover:text-accent line-clamp-1 w-full text-right text-balance transition-colors">
            {nextPost.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
