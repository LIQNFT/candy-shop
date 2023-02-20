import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import './style.less';

interface SwitchProps {
  name: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ className = '', children, name }) => {
  const { register } = useFormContext();
  const checked = useWatch({ name });

  return (
    <div className={`candy-switch${checked ? ` candy-switch-checked` : ''} ${className}`}>
      <input type="checkbox" id={name} className="react-switch-checkbox" {...register(name)} />
      <label className="react-switch-label" htmlFor={name}>
        <span className="react-switch-button" />
      </label>
      <label className="candy-switch-label" htmlFor={name}>
        {children}
      </label>
    </div>
  );
};
