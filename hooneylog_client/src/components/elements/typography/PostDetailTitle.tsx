import React from 'react';
import styled from 'styled-components';
import { TypographyProps } from '.';

const PostDetailTitle = (props: TypographyProps) => {
  return <Container>{props.children}</Container>;
};

export default PostDetailTitle;

const Container = styled.h1`
  font-size: 3rem;
  margin: 2rem 0;
`;
