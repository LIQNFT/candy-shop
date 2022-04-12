import styled from '@emotion/styled';
import React, { useEffect } from 'react';

export interface ModalProps {
  children: any;
  onCancel: (...args: any) => void;
  width?: number;
}

const Modal: React.FC<ModalProps> = ({
  children,
  onCancel,
  width = 1000,
}: ModalProps) => {
  useEffect(() => {
    window.addEventListener('click', onCancel);
    return window.removeEventListener('click', onCancel);
  }, [onCancel]);

  return (
    <Container
      width={width}
      className="cds-modal-mask"
      onClick={() => {
        onCancel();
      }}
    >
      <div
        className="cds-modal-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Close onClick={onCancel}>
          <div className="cds-close" />
        </Close>
        {children}
      </div>
    </Container>
  );
};

export default Modal;

const Container = styled.div<{
  width: number;
}>`
  padding-bottom: 20px;
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);

  .cds-modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    padding: 20px;
    max-width: 90vw;
    width: ${({ width }) => width || 1000}px;
    max-height: 80vh;
    overflow-y: auto;

    border-radius: 16px;
    border: 2px solid #000;
    background-color: #fff;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
  }
`;

const Close = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 50px;
  height: 50px;

  .cds-close {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    opacity: 0.3;
    transition: 0.2s all ease-in-out;

    &:hover {
      opacity: 1;
      cursor: pointer;
    }
    &:before,
    &:after {
      position: absolute;
      top: 5px;
      left: 15px;
      content: ' ';
      height: 22px;
      width: 3px;
      background-color: #333;
    }
    &:before {
      transform: rotate(45deg);
    }
    &:after {
      transform: rotate(-45deg);
    }
  }
`;
