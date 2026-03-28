import React from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { ITag } from 'services/notion/notionApi';
import styled from 'styled-components';
import Typography from 'components/elements/typography';
import TagGroup from 'components/blocks/tagGroup/TagGroup';
import Image from 'components/elements/image';
import FlexContainer from 'components/templates/container/FlexContainer';

interface PostDetailInfoProps {
  title: string;
  createdAt: string;
  tags: ITag[];
}

const Container = styled.header``;

const PostDetailInfo = ({ title, createdAt, tags }: PostDetailInfoProps) => {
  return (
    <Container>
      <Typography typoType="POST_DETAIL_TITLE">{title}</Typography>
      <FlexContainer gap="1rem" alignItems="center">
        <Image imageType="PROFILE" borderRadius="50%" width="40rem" height="40rem" alt="프로필 이미지" />
        <Typography typoType="POST_DESC">Seunghoon Shin</Typography>
      </FlexContainer>
      <Typography typoType="DATE" margin="1.5rem 0">
        {createdAt}
      </Typography>
      <TagGroup tags={tags} />
    </Container>
  );
};

export default PostDetailInfo;
