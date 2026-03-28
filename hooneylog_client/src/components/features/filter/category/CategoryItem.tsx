/* eslint-disable react/jsx-no-bind */
import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';

interface CategoryItemProps {
  name: string;
  count: number;
  isActive: boolean;
  onClick: (name: string) => void;
}

const CategoryItem = ({ name, count, isActive, onClick }: CategoryItemProps) => {
  return (
    <Container onClick={onClick.bind(this, name)}>
      <CategoryTitle isActive={isActive}>{name}</CategoryTitle>
      <CategoryCount>{count}</CategoryCount>
    </Container>
  );
};

export default CategoryItem;

const Container = styled.li`
  border-radius: 0.5rem;
  border: 0.1rem solid ${Colors.black26};
  display: flex;
  overflow: hidden;
  cursor: pointer;
`;

const CategoryTitle = styled.span<{ isActive: boolean }>`
  color: ${Colors.black26};
  font-size: 1.7rem;
  text-align: center;
  padding: 0.5rem;

  ${({ isActive }) => {
    if (isActive) {
      return `background-color: ${Colors.mainColor};
              color: ${Colors.whiteColor};`;
    }
    return `background-color: ${Colors.whiteColor};
            color: ${Colors.black26};`;
  }}
`;

const CategoryCount = styled.span`
  color: ${Colors.whiteColor};
  text-align: center;
  font-size: 1.7rem;
  background-color: ${Colors.black26};
  padding: 0.5rem;
`;
