import PostBlock from 'components/elements/postBlock/PostBlock';
import { Fragment } from 'react';
import styles from './BlockNestedList.module.scss';

const BlockNestedList = (block: any) => {
  const { type } = block;
  const value = block[type];
  if (!value) return null;

  const isNumberedList = value.children[0].type === 'numbered_list_item';

  if (isNumberedList) {
    return (
      <ol className={styles.order_list}>
        {value.children.map((block: any, index: number) => (
          <Fragment key={index}>
            <PostBlock block={block} />
          </Fragment>
        ))}
      </ol>
    );
  }
  return (
    <ul className={styles.unorder_list}>
      {value.children.map((block: any, index: number) => (
        <Fragment key={index}>
          <PostBlock block={block} />
        </Fragment>
      ))}
    </ul>
  );
};

export default BlockNestedList;
