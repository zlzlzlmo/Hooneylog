import React from 'react';
import styled from 'styled-components';
import InnerContainer from '../container/InnerContainer';
import Footer from './footer/Footer';
import Header from './header/Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Container>
      <Header />
      <InnerContainer>{children}</InnerContainer>
      <Footer />
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  display: grid;
  grid-template-rows: 6rem 1fr 10rem;
  position: relative;
  width: 100vw;
  min-height: 100vh;
`;
