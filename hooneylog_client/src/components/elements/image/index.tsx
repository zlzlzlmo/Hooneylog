import React, { Component } from 'react';
import Profile from 'assets/images/profile.png';
import styled from 'styled-components';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

// ImageType 정의
const OImageType = {
  profile: 'PROFILE',
  post: 'POST',
} as const;

type ImageType = typeof OImageType[keyof typeof OImageType];

// ImageProps 타입 정의 (src 제거)
export interface ImageProps extends Omit<NextImageProps, 'src'> {
  imageType: ImageType;
  borderRadius?: string;
}

// 스타일링된 Next.js Image 컴포넌트
const ImageStyled = styled(NextImage)<{ borderRadius?: string }>`
  border-radius: ${({ borderRadius }) => borderRadius || '0'};
`;

class Image extends Component<ImageProps> {
  renderElement(props: ImageProps) {
    const { imageType, ...restProps } = props; // imageType을 제외하고 나머지 props 추출

    switch (imageType) {
      case OImageType.profile:
        return (
          <ImageStyled
            src={Profile} // Profile 이미지를 강제로 적용
            layout="responsive" // Next.js에서 지원되는 layout 값
            {...restProps}
          />
        );

      default:
        console.error('Image Props 확인');
        return null; // fallback for invalid imageType
    }
  }

  render() {
    return this.renderElement(this.props);
  }
}

export default Image;
