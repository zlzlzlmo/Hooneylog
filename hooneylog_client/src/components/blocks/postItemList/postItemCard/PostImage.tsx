/* eslint-disable func-names */
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Colors } from 'styles/variables';
import styles from './PostImage.module.scss';

interface PostImageProps {
  width: string;
  src: string;
  alt: string;
}

const PostImage = ({ src, alt }: PostImageProps) => {
  return (
    <Container>
      <Image
        src={src}
        alt={alt}
        layout="fill"
        onError={(e) => {
          replaceErrorImageWith(e)(alt);
        }}
      />
    </Container>
  );
};

export default PostImage;

const Container = styled.div`
  position: relative;
  width: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

function replaceErrorImageWith(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  return function (alt: string) {
    const imageElement = e.target as HTMLImageElement;
    const newElement = document.createElement('div');
    newElement.classList.add(styles.replacedImage);
    newElement.textContent = alt;
    imageElement.parentElement?.replaceWith(newElement);
  };
}
