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
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-10 my-10 border-t border-b border-notion-border"
    >
      {previousPost ? (
        <Link
          href={`/post/${previousPost.id}`}
          className="group flex flex-col items-start hover:bg-notion-hover p-4 rounded-lg transition-colors w-full"
        >
          <span className="text-notion-secondary text-sm mb-2 font-medium">&larr; 이전 글</span>
          <span className="font-bold text-lg text-notion-text group-hover:text-notion-blue-text line-clamp-1 w-full text-left transition-colors">
            {previousPost.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {nextPost && (
        <Link
          href={`/post/${nextPost.id}`}
          className="group flex flex-col items-end hover:bg-notion-hover p-4 rounded-lg transition-colors w-full text-right sm:col-start-2"
        >
          <span className="text-notion-secondary text-sm mb-2 font-medium">다음 글 &rarr;</span>
          <span className="font-bold text-lg text-notion-text group-hover:text-notion-blue-text line-clamp-1 w-full text-right transition-colors">
            {nextPost.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
