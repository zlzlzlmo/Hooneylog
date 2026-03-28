import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import { TypographyProps } from '.';

const ReadMore = (props: TypographyProps) => {
  return <Container>{props.children}</Container>;
};

export default ReadMore;

const Container = styled.span`
  color: ${Colors.subColor};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    transition: all 0.1s ease-in-out;
  }
`;
