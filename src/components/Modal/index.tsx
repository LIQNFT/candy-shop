import React, { useRef } from 'react';

import styled from '@emotion/styled';

import { useClickOutside } from '../../hooks/useClickOutside';

// import './style.less';

export interface ModalProps {
  children: any;
  onCancel: (...args: any) => void;
}

const Modal: React.FC<ModalProps> = ({ children, onCancel }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>();
  useClickOutside(modalRef, onCancel);

  return (
    <Container className="cds-modal-mask">
      <div
        ref={modalRef}
        id="cds-modal-content"
        className="candy-container cds-modal-content"
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

const Container = styled.div`
  padding-bottom: 20px;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);

  .cds-modal-content {
    position: relative;
    background-color: #fff;
    background-clip: padding-box;
    border: 0;
    border-radius: 2px;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
    pointer-events: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 90%;
    width: 600px;
    border-radius: 8px;
    padding: 20px;
  }
`;

const Close = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row-reverse;

  .cds-close {
    position: absolute;
    right: 15px;
    top: 15px;
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
