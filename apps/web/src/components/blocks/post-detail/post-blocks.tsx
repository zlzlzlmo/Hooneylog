import React, { Fragment } from 'react';
import { BlockObjectResponse } from '@hooneylog/shared-types';
import { PostBlock } from '@/components/elements/post-block/post-block';

interface PostBlocksProps {
  blocks: BlockObjectResponse[];
}

export function PostBlocks({ blocks }: PostBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <article className="w-full pb-20">
      {blocks.map((block) => (
        <Fragment key={block.id as React.Key}>
          <PostBlock block={block} />
        </Fragment>
      ))}
    </article>
  );
}
