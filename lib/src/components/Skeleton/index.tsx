import styled from '@emotion/styled';
import React from 'react';

export const Skeleton = () => {
  return (
    <Wrap>
      <Container>
        <Animation />
        <Item w={50} mb={24} />
        <Item mb={12} />
        <Item mb={12} />
        <Item w={80} />
      </Container>
    </Wrap>
  );
};

const Wrap = styled.div`
  padding: 42px 24px;
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;
`;

const Animation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateX(-80px);
  animation: skeleton-shine 1200ms linear 1200ms infinite;
  @keyframes skeleton-shine {
    0% {
      transform: translateX(-80px);
    }

    40%,
    100% {
      transform: translateX(100%);
    }
  }

  &::before {
    content: '';
    display: block;
    width: 80px;
    height: 100%;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
  }
`;

const Item = styled.div<{
  w?: number;
  mb?: number;
}>`
  height: 16px;
  background-color: #d1d7dc;

  width: ${({ w }) => (w ? w : 100)}%;
  margin-bottom: ${({ mb }) => (mb ? mb : 0)}px;
`;
