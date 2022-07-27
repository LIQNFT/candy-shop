import React, { useEffect } from 'react';

import './index.less';

export interface ModalProps {
  children: any;
  onCancel: (...args: any) => void;
  width?: number;
  className?: string;
  closeOnClickOutside?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  onCancel,
  width = 1000,
  className = '',
  closeOnClickOutside = true
}: ModalProps) => {
  useEffect(() => {
    window.addEventListener('click', onCancel);
    return window.removeEventListener('click', onCancel);
  }, [onCancel]);

  return (
    <div className={`candy-modal ${className}`} onClick={() => closeOnClickOutside && onCancel()}>
      <div className="candy-modal-content" style={{ width: `${width}px` }} onClick={(e) => e.stopPropagation()}>
        <div className="candy-modal-close-btn" onClick={onCancel}>
          <div className="close" />
        </div>
        {children}
      </div>
    </div>
  );
};
