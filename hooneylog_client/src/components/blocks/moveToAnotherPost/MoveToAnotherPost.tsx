import { NotionPost } from 'services/notion/notionApi';
import AnotherPost from 'components/elements/anotherPost';
import React from 'react';
import createAnotherPost from 'util/anotherPost/createAnotherPost';
import styles from './MoveToAnotherPost.module.scss';

interface MoveToAnotherPostProps {
  notionList: NotionPost[];
  notionPost: NotionPost;
}

const MoveToAnotherPost = ({ notionList, notionPost }: MoveToAnotherPostProps) => {
  const previous = createAnotherPost({ type: 'previos', notionList, currentPost: notionPost });
  const next = createAnotherPost({ type: 'next', notionList, currentPost: notionPost });

  return (
    <div className={styles.container}>
      {previous.getPost() && <AnotherPost postType="PREVIOS" postItem={previous.getPost()} />}
      {next.getPost() && <AnotherPost postType="NEXT" postItem={next.getPost()} />}
    </div>
  );
};

export default MoveToAnotherPost;
