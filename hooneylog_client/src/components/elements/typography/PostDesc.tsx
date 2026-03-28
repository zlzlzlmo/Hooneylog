import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import { TypographyProps } from '.';

const PostDesc = (props: TypographyProps) => {
  return <Container>{props.children}</Container>;
};

export default PostDesc;

const Container = styled.p`
  color: ${Colors.greyColor};
  font-size: 1.5rem;
`;
