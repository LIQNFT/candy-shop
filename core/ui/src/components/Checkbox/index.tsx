import React from 'react';

import { IconCheck } from 'assets/IconCheck';

import './style.less';

interface CheckboxProps {
  fill?: string;
  checked: boolean;
  label?: string;
  id: string;
  onClick?: any;
}

export const Checkbox: React.FC<CheckboxProps> = ({ fill = '#7522f5', checked, id, label, onClick }) => {
  return (
    <div className="candy-checkbox-container">
      <div className={`candy-checkbox ${checked ? '' : 'candy-checkbox-disable'}`} onClick={onClick}>
        <IconCheck fill={fill} />
        <input type="checkbox" id={id} className="candy-checkbox-input" />
      </div>
      {label && (
        <label className="candy-checkbox-label" htmlFor={id} onClick={onClick}>
          {label}
        </label>
      )}
    </div>
  );
};
