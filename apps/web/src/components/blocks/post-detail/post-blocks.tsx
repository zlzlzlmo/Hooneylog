import React, { Fragment } from 'react';
import { BlockObjectResponse } from '@hooneylog/shared-types';
import { PostBlock } from '@/components/elements/post-block/post-block';
import { groupBlocks } from '@/components/elements/post-block/group-blocks';

interface PostBlocksProps {
  blocks: BlockObjectResponse[];
}

export function PostBlocks({ blocks }: PostBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  const groups = groupBlocks(blocks);

  return (
    <article className="w-full pb-20">
      {groups.map((group, i) => {
        if (group.kind === 'ul') {
          return (
            <ul key={`ul-${i}`} className="my-[8px]">
              {group.items.map((block) => (
                <PostBlock key={block.id as React.Key} block={block} />
              ))}
            </ul>
          );
        }
        if (group.kind === 'ol') {
          return (
            <ol key={`ol-${i}`} className="my-[8px]">
              {group.items.map((block) => (
                <PostBlock key={block.id as React.Key} block={block} />
              ))}
            </ol>
          );
        }
        return (
          <Fragment key={group.block.id as React.Key}>
            <PostBlock block={group.block} />
          </Fragment>
        );
      })}
    </article>
  );
}
