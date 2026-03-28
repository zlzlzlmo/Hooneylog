import { ITag } from 'services/notion/notionApi';
import Tag from 'components/elements/tag';
import React, { Fragment } from 'react';
import styled from 'styled-components';

interface TagGroupProps {
  tags: ITag[];
}

const TagGroup = ({ tags }: TagGroupProps) => {
  return (
    <Container>
      {tags.map(({ name }) => (
        <Fragment key={name}>
          <Tag tagType="POST">{name}</Tag>
        </Fragment>
      ))}
    </Container>
  );
};

export default TagGroup;

const Container = styled.ul`
  display: flex;
  column-gap: 2rem;
  row-gap: 0.7rem;
  width: 100%;
  flex-wrap: wrap;
`;
