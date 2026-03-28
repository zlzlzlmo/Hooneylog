import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import { BiSearch } from 'react-icons/bi';

interface SearchProps {
  searchValue: string;
  handleSearchValue: (text: string) => void;
}

const Search = ({ searchValue, handleSearchValue }: SearchProps) => {
  return (
    <Container>
      <SearchInput
        placeholder="검색어를 입력하세요"
        value={searchValue}
        onChange={(e) => handleSearchValue(e.target.value)}
      />
      <SearchIcon />
    </Container>
  );
};

export default Search;

const Container = styled.section`
  width: 100%;
  height: 4rem;
  border: 0.2rem solid ${Colors.subColor};
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
`;

const SearchInput = styled.input`
  border: none;
  height: 100%;
  padding-left: 5rem;
  width: 100%;
  outline: none;
  caret-color: ${Colors.subColor};
  font-size: 1.8rem;
`;

const SearchIcon = styled(BiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  color: ${Colors.mainColor};
`;
