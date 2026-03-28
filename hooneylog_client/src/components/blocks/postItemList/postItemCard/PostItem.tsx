import Link from 'next/link';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { showArticle } from 'styles/keyframes';
import Typography from 'components/elements/typography';
import TagGroup from 'components/blocks/tagGroup/TagGroup';
import CategoryImage from 'util/categoryImage/categoryImage';
import PostImage from 'components/blocks/postItemList/postItemCard/PostImage';
import { ITag } from 'services/notion/notionApi';
import useElementVisible from 'hooks/useElementVisible/useElementVisbile';

interface PostItemProps {
  title: string;
  createdAt: string;
  id: string;
  category: string;
  description: string;
  tags: ITag[];
}

const PostItem = ({ title, createdAt, id, category, description, tags }: PostItemProps) => {
  const articleRef = useRef(null);
  const { timeToShow } = useElementVisible({ articleRef });

  if (!timeToShow) {
    return (
      <Link href={`post/${id}`} passHref>
        <a ref={articleRef} />
      </Link>
    );
  }

  return (
    <Container>
      <PostImage width="100%" src={new CategoryImage(category).src} alt={category} />
      <Content>
        <Link href={`post/${id}`} passHref>
          <a>
            <Typography typoType="POST_TITLE">{title}</Typography>
          </a>
        </Link>

        <Typography typoType="DATE">{createdAt}</Typography>
        <TagGroup tags={tags} />
        <Typography typoType="POST_DESC">{description}</Typography>
        <Link href={`post/${id}`} passHref>
          <a>
            <Typography typoType="READ_MORE">Read More</Typography>
          </a>
        </Link>
      </Content>
    </Container>
  );
};

export default PostItem;

const Container = styled.article`
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-column-gap: 3rem;
  animation: ${showArticle} 0.6s;
`;

const Content = styled.section`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;
