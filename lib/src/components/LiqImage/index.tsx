import styled from '@emotion/styled';
import React from 'react';
import imgDefault from '../../assets/img-default.png';

interface LiqImageProps {
  src: string | undefined | null;
  alt: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const LiqImage: React.FC<LiqImageProps> = ({ src, alt, style = {} }) => {
  return (
    <>
      <Wrap style={style}>
        <Image
          src={src ? src : imgDefault}
          alt={src ? alt : 'No metadata found'}
        />
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  background-color: #e5e5e5;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
