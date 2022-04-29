import React, { useEffect } from 'react';

import './index.less';

export interface ModalProps {
  children: any;
  onCancel: (...args: any) => void;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ children, onCancel, width = 1000 }: ModalProps) => {
  useEffect(() => {
    window.addEventListener('click', onCancel);
    return window.removeEventListener('click', onCancel);
  }, [onCancel]);

  return (
    <div
      className="candy-modal"
      onClick={() => {
        onCancel();
      }}
    >
      <div
        className="candy-modal-content"
        style={{ width: `${width}px` }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="candy-modal-close-btn" onClick={onCancel}>
          <div className="close" />
        </div>
        {children}
      </div>
    </div>
  );
};
