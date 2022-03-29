import React from 'react';
import styled from '@emotion/styled';

import IconTick from '../../assets/IconTick';
import imgDefault from '../../assets/img-default.png';

export interface SellModalProps {
  onCancel: any;
  image: string;
  name: string;
}

const ProcessSuccess: React.FC<SellModalProps> = ({
  image = imgDefault,
  onCancel,
  name,
}: SellModalProps) => {
  return (
    <Container>
      <div className="candy-title">
        <IconTick />
      </div>
      <div className="sell-modal-content sell-modal-success">
        <img src={image} alt="" />
        <div className="candy-title">{name} is now listed for sale</div>
      </div>
      <div className="sell-modal-success">
        <button className="candy-button" onClick={onCancel}>
          View listing
        </button>
      </div>
    </Container>
  );
};

export default ProcessSuccess;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
