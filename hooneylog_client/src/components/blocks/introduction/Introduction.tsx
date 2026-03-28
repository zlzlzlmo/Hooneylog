import Image from 'components/elements/image';
import FlexContainer from 'components/templates/container/FlexContainer';
import InnerContainer from 'components/templates/container/InnerContainer';
import React from 'react';
import styled from 'styled-components';
import { Width } from 'styles/variables';

const Introduction = () => {
  return (
    <Container>
      <InnerContainer>
        <DynamicContainer>
          <Image imageType="PROFILE" borderRadius="50%" alt="프로필 이미지" />
          <FlexContainer flexDirection="column">
            <Title>신승훈 블로그</Title>
            <SubTitle>기록과 함께 성장해 나가는 한 프론트엔드개발자의 이야기</SubTitle>
          </FlexContainer>
        </DynamicContainer>
      </InnerContainer>
    </Container>
  );
};

export default Introduction;

const Container = styled.div`
  width: 100%;
  padding: 5rem 0;
`;

const Title = styled.h2`
  font-size: 3rem;
`;

const SubTitle = styled.p`
  font-size: 2rem;
  color: rgba(0, 0, 0, 0.54);
`;

const DynamicContainer = styled.section`
  display: flex;
  align-items: center;
  gap: 3rem;

  @media (max-width: ${Width.mobileMax}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
