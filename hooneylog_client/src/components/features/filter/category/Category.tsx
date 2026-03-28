import React, { Fragment } from 'react';
import styled from 'styled-components';
import CategoryItem from './CategoryItem';

interface CategoryProps {
  categories: [string, number][];
  currentActiveCategory: string;
  handleCurrentActiveCategory: (cate: string) => void;
}

const Category = ({ categories, currentActiveCategory, handleCurrentActiveCategory }: CategoryProps) => {
  return (
    <Container>
      {categories.map(([name, count], index) => (
        <Fragment key={index}>
          <CategoryItem
            name={name}
            count={count}
            isActive={name === currentActiveCategory}
            onClick={handleCurrentActiveCategory}
          />
        </Fragment>
      ))}
    </Container>
  );
};

export default Category;

const Container = styled.ul`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 1rem;
`;
