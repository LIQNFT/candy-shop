import { Tooltip } from 'components/Tooltip';
import React, { memo, ReactElement } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

import './style.less';

interface DatePickerProps {
  label?: string | ReactElement;
  labelTip?: string;
  name: string;
  disabled?: boolean;
  required?: boolean;
  hidden?: boolean;
  min?: string;
}

export const DatePicker: React.FC<DatePickerProps> = memo(({ name, required, label, hidden, min, labelTip }) => {
  const { register } = useFormContext();
  const { errors } = useFormState();

  return (
    <div hidden={hidden} className="candy-form-date-picker">
      {label && (
        <label className="candy-form-date-picker-label" htmlFor={name}>
          {label}
          {labelTip && (
            <Tooltip inner={labelTip}>
              <span className="candy-icon-question" />
            </Tooltip>
          )}
        </label>
      )}
      <input type="date" id={name} {...register(name, { required, min })} />
      {errors[name]?.message && <span className="candy-form-error">{errors[name]?.message}</span>}
      {!errors[name]?.message && errors[name]?.type === 'min' && (
        <span className="candy-form-error">Minimum value is {min}</span>
      )}
    </div>
  );
});
