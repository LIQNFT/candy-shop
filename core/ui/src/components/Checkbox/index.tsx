import React from 'react';

import { IconCheck } from 'assets/IconCheck';

import './style.less';

interface CheckboxProps {
  checked: boolean;
  label?: string | React.ReactNode;
  id: string;
  onClick?: any;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, id, label, onClick, className = '', disabled }) => {
  return (
    <div className={`candy-checkbox-container ${className}${disabled ? ' candy-checkbox-container-disabled' : ''}`}>
      <div className={`candy-checkbox ${checked ? '' : 'candy-checkbox-disable'}`} onClick={onClick}>
        <IconCheck />
        <input type="checkbox" id={id} className="candy-checkbox-input" />
      </div>
      {label && (
        <label className="candy-checkbox-label" onClick={onClick}>
          {label}
        </label>
      )}
    </div>
  );
};
