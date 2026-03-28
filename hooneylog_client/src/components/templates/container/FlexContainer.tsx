import React from 'react';
import styled from 'styled-components';

interface FlexContainerProps {
  children: React.ReactNode;
  height?: string;
  justifyContent?: string;
  alignItems?: string;
  display?: 'inline-flex' | 'flex';
  flexDirection?: 'column' | 'row';
  gap?: string;
  width?: string;
}

const FlexContainer = (props: FlexContainerProps) => {
  return <Container {...props}>{props.children}</Container>;
};

export default FlexContainer;

const Container = styled.div<FlexContainerProps>`
  display: ${({ display }) => display || 'flex'};
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height && height};
  justify-content: ${({ justifyContent }) => justifyContent && justifyContent};
  align-items: ${({ alignItems }) => alignItems && alignItems};
  flex-direction: ${({ flexDirection }) => flexDirection || 'row'};
  gap: ${({ gap }) => gap && gap};
`;
