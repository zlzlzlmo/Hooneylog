import PostBlock from 'components/elements/postBlock/PostBlock';
import React, { Fragment } from 'react';
import styles from './PostBlock.module.scss';

interface PostBlocksProps {
  blocks: any;
}

const PostBlocks = ({ blocks }: PostBlocksProps) => {
  return (
    <main className={styles.main_content}>
      {blocks.map((block: any) => (
        <Fragment key={block.id}>
          <PostBlock block={block} />
        </Fragment>
      ))}
    </main>
  );
};

export default PostBlocks;
