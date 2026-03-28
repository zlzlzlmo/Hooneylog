import { Fragment, useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useIntersectionObserver from 'hooks/useIntersection/useIntersection';
import BlockNestedList from 'components/blocks/blockNestedList/BlockNestedList';
import NotionBlockText from '../notionBlockText/NotionBlockText';
import styles from './PostBlock.module.scss';

const PostBlock = ({ block }: any) => {
  const { type, id } = block;
  const value = block[type];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const entry = useIntersectionObserver(headingRef, {});
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!entry) {
      return;
    }

    if (entry?.intersectionRatio > 0.5) {
      setVisible(true);
    }
  }, [entry]);

  switch (type) {
    case 'paragraph':
      return (
        <p className={styles.paragraph}>
          <NotionBlockText richText={value.rich_text} />
        </p>
      );
    case 'heading_1':
      return (
        <h1 className={`${styles.heading} ${styles.headingOne} ${visible && styles.visible}`} ref={headingRef}>
          {value.rich_text[0].plain_text}{' '}
        </h1>
      );
    case 'heading_2':
      return (
        <h2 className={`${styles.heading} ${styles.headingTwo} ${visible && styles.visible}`} ref={headingRef}>
          {value.rich_text[0].plain_text}{' '}
        </h2>
      );
    case 'heading_3':
      return <h3 className={`${styles.heading} ${styles.headingThree}`}>{value.rich_text[0].plain_text} </h3>;
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li className={styles.list}>
          <NotionBlockText richText={value.rich_text} />
          {!!value.children && BlockNestedList(block)}
        </li>
      );
    // case 'to_do':
    //   return (
    //     <div>
    //       <label htmlFor={id}>
    //         <input type="checkbox" id={id} defaultChecked={value.checked} /> <Text text={value.text} />
    //       </label>
    //     </div>
    //   );
    case 'toggle':
      return (
        <details>
          <summary>
            <NotionBlockText richText={value.rich_text} />
          </summary>
          {value.children?.map((block: any) => (
            <Fragment key={block.id}>{PostBlock(block)}</Fragment>
          ))}
        </details>
      );
    case 'child_page':
      return <p>{value.title}</p>;
    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure className={styles.image_box}>
          <LazyLoadImage effect="blur" src={src} alt={caption} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    case 'divider':
      return <hr className={styles.hr} key={id} />;
    case 'quote':
      return (
        <blockquote className={styles.blockquote} key={id}>
          {value.rich_text[0].plain_text}
        </blockquote>
      );
    case 'code':
      return (
        <SyntaxHighlighter className={styles.code_block} language="typescript">
          {value.rich_text[0].plain_text}
        </SyntaxHighlighter>
      );
    // case 'file':
    //   const src_file = value.type === 'external' ? value.external.url : value.file.url;
    //   const splitSourceArray = src_file.split('/');
    //   const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
    //   const caption_file = value.caption ? value.caption[0]?.plain_text : '';
    //   return (
    //     <figure>
    //       <div className={styles.file}>
    //         📎{' '}
    //         <Link href={src_file} passHref>
    //           {lastElementInArray.split('?')[0]}
    //         </Link>
    //       </div>
    //       {caption_file && <figcaption>{caption_file}</figcaption>}
    //     </figure>
    //   );
    case 'bookmark':
      const href = value.url;
      return (
        <a href={href} target="_brank" className={styles.bookmark}>
          {href}
        </a>
      );
    default:
      return <span>`❌ Unsupported block (${type === 'unsupported' ? 'unsupported by Notion API' : type})`</span>;
  }
};

export default PostBlock;
