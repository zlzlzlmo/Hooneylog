import React from 'react';
import styled from 'styled-components';
import { moveTagName } from 'styles/keyframes';
import { Colors } from 'styles/variables';
import { TagProps } from '.';

const PostTag = (props: TagProps) => {
  return <Tag>{props.children}</Tag>;
};

export default PostTag;

const Tag = styled.li`
  display: inline-block;
  text-align: center;
  font-size: 1.5rem;
  background-color: ${Colors.subColor};
  color: ${Colors.whiteColor};
  height: 2.6rem;
  line-height: 2.6rem;
  padding: 0 2rem 0 2.3rem;
  border-radius: 0.3rem 0 0 0.3rem;
  position: relative;
  &:hover {
    display: inline-block;
    background-color: ${Colors.mainColor};
    animation: ${moveTagName} 1.5s linear infinite;
    &::after {
      border-left: 1rem solid ${Colors.mainColor};
    }
  }

  &::before {
    content: '';
    top: 1rem;
    left: 1rem;
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 1rem;
    background: ${Colors.whiteColor};
    box-shadow: inset 0 0.1rem rgb(0 0 0 / 25%);
  }

  &::after {
    border-left: 1rem solid ${Colors.subColor};
    content: '';
    position: absolute;
    right: -1rem;
    top: 0;
    border-bottom: 1.3rem solid transparent;
    border-top: 1.3rem solid transparent;
    transition: background 0.3s, color 0.3s;
  }
`;
