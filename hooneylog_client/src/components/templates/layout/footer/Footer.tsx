import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';

const Footer = () => {
  return <Container>Copyright © made by seunghoon</Container>;
};

export default Footer;
const Container = styled.footer`
  width: 100%;
  background-color: ${Colors.black26};
  color: ${Colors.whiteColor};
  display: flex;
  justify-content: center;
  align-items: center;
`;
