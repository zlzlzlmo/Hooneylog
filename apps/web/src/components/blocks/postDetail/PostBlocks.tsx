import React, { Fragment } from 'react';
import { PostBlock } from '@/components/elements/postBlock/PostBlock';

interface PostBlocksProps {
  blocks: any[];
}

export function PostBlocks({ blocks }: PostBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <article className="w-full mx-auto max-w-[850px] pb-20">
      {blocks.map((block) => (
        <Fragment key={block.id}>
          <PostBlock block={block} />
        </Fragment>
      ))}
    </article>
  );
}
