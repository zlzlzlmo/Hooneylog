import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import { ButtonProps } from '.';

const BasicButton = (props: ButtonProps) => {
  return <Button {...props}>{props.children}</Button>;
};

export default BasicButton;

const Button = styled.button`
  background-color: ${Colors.mainColor};
  border: none;
  padding: 2rem;
`;
