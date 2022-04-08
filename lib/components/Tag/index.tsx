import React from 'react';
import styled from '@emotion/styled';

interface TagProps {
  text: string;
}

export const Tag: React.FunctionComponent<TagProps> = ({ text }) => {
  return <Wrap>{text}</Wrap>;
};

const Wrap = styled.div`
  padding: 1px 8px;
  background-color: #e0e0e0;
  border-radius: 8px;
  font-size: 12px;
`;
