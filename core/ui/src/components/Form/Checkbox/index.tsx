import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { IconCheck } from 'assets/IconCheck';
import './style.less';
import { Tooltip } from 'components/Tooltip';

interface CheckboxProps {
  label?: string | React.ReactNode;
  labelTip?: string;
  id: string;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, label, className = '', disabled, labelTip }) => {
  const { register, setValue } = useFormContext();
  const value = useWatch({ name: id });

  return (
    <div className={`candy-checkbox-container ${className}${disabled ? ' candy-checkbox-container-disabled' : ''}`}>
      <div className={`candy-checkbox ${value ? '' : 'candy-checkbox-disable'}`} onClick={() => setValue(id, !value)}>
        <IconCheck />
        <input type="checkbox" id={id} className="candy-checkbox-input" {...register(id)} />
      </div>
      {label && (
        <label className="candy-checkbox-label" htmlFor={id}>
          {label}
          {labelTip && (
            <Tooltip inner={labelTip}>
              <span className="candy-icon-question" />
            </Tooltip>
          )}
        </label>
      )}
    </div>
  );
};
