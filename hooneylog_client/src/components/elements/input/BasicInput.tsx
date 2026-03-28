import React from 'react';
import styled from 'styled-components';
import { InputProps } from '.';

const BasicInput = (props: InputProps) => {
  return <Input {...props} />;
};

export default BasicInput;

const Input = styled.input<InputProps>`
  border: none;
  height: 3rem;
  border-radius: 0.5rem;
  padding: 0;
  width: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
  ${({ activeInput }) =>
    activeInput &&
    `
      padding: 0 2rem;
      width: 20rem;
      visibility: visible;
      transition: all 0.3s ease-in-out;
  `}
`;
