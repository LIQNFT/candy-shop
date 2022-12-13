import React from 'react';
import './style.less';

interface SwitchProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLDivElement>) => void;
  name: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ className = '', onChange, checked, children, name }) => {
  return (
    <div className={`candy-switch${checked ? ` candy-switch-checked` : ''} ${className}`} onChange={onChange}>
      <input type="checkbox" id={name} name={name} className="react-switch-checkbox" />
      <label className="react-switch-label" htmlFor={name}>
        <span className="react-switch-button" />
      </label>
      <label className="candy-switch-label" htmlFor={name}>
        {children}
      </label>
    </div>
  );
};
