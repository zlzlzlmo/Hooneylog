import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import { GrLinkPrevious } from 'react-icons/gr';
import Link from 'next/link';
import { AnotherPostProps } from '.';

const PreviosPost = (props: AnotherPostProps) => {
  return (
    <Link href={`/post/${props.postItem?.id}`}>
      <a>
        <Container>
          <span>
            <GrLinkPrevious />
          </span>
          <span>{props.postItem?.title}</span>
        </Container>
      </a>
    </Link>
  );
};

export default PreviosPost;

const Container = styled.span`
  display: inline-flex;
  background-color: ${Colors.subColor};
  color: ${Colors.whiteColor};
  padding: 1rem 1rem;
  font-size: 1.4rem;
  border-radius: 0.7rem;
  cursor: pointer;
  text-align: left;
  gap: 1rem;
  align-items: center;
  span {
    vertical-align: text-top;
  }
`;
