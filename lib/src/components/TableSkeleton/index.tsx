import styled from '@emotion/styled';
import React from 'react';

interface TableSkeletonProps {
  numCol: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ numCol }) => {
  return (
    <Container>
      {Array.from({ length: numCol }).map((_, idx) => (
        <td key={idx}>
          <Item w={40} />
        </td>
      ))}
    </Container>
  );
};

const Container = styled.tr`
  position: relative;
  overflow: hidden;
  height: 40px;
`;

const Item = styled.div<{ w?: number }>`
  height: 16px;
  background-color: #d1d7dc;

  width: ${({ w }) => (w ? w : 100)}%;

  &::before {
    content: '';
    display: block;
    width: 80px;
    height: 100%;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
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
  }
`;
