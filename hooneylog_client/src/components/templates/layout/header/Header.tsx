import FlexContainer from 'components/templates/container/FlexContainer';
import InnerContainer from 'components/templates/container/InnerContainer';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';
import { Colors, Width } from 'styles/variables';

const Header = () => {
  const router = useRouter();

  return (
    <Container>
      <InnerContainer width="100%">
        <FlexContainer alignItems="center" height="100%" justifyContent="space-between">
          <Logo onClick={() => router.push('/')}>HooneyLog</Logo>
        </FlexContainer>
      </InnerContainer>
    </Container>
  );
};

export default Header;

const Container = styled.header`
  width: 100vw;
  height: 6rem;
  color: #fff;
  background-color: ${Colors.mainColor};

  @media (max-width: ${Width.mobileMax}) {
    padding: 0 5%;
  }
`;

const Logo = styled.h1`
  display: flex;
  justify-content: flex-end;
  user-select: none;
  font-weight: 700;
  font-size: min(max(2.5rem, 3vw), 2rem);
  cursor: pointer;
`;
