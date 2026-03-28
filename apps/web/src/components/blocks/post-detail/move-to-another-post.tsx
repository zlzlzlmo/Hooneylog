import React from 'react';
import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';

interface MoveToAnotherPostProps {
  previousPost: NotionPost | null;
  nextPost: NotionPost | null;
}

export function MoveToAnotherPost({ previousPost, nextPost }: MoveToAnotherPostProps) {
  return (
    <div className="flex justify-between items-center gap-4 py-10 my-10 border-t border-b border-gray-200">
      {/* Previous Post (Older) */}
      <div className="flex-1 flex justify-start w-1/2">
        {previousPost && (
          <Link href={`/post/${previousPost.id}`} className="group flex flex-col items-start hover:bg-gray-50 p-4 rounded-lg transition-colors w-full">
            <span className="text-gray-400 text-sm mb-2 font-medium">&larr; 이전 글</span>
            <span className="font-bold text-lg text-gray-800 group-hover:text-main line-clamp-1 w-full text-left">
              {previousPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* Next Post (Newer) */}
      <div className="flex-1 flex justify-end w-1/2">
        {nextPost && (
          <Link href={`/post/${nextPost.id}`} className="group flex flex-col items-end hover:bg-gray-50 p-4 rounded-lg transition-colors w-full text-right">
            <span className="text-gray-400 text-sm mb-2 font-medium">다음 글 &rarr;</span>
            <span className="font-bold text-lg text-gray-800 group-hover:text-main line-clamp-1 w-full text-right">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
