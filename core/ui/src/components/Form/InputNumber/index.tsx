import React, { ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';

import './style.less';

interface InputNumberProps {
  label?: string | ReactElement;
  labelTip?: string;
  name: string;
  maxLength?: number;
  disabled?: boolean;
  requiredMsg?: string;
  required?: boolean;
  hidden?: boolean;
  suffix?: string | ReactElement;
  min?: number;
  max?: number;
  placeholder?: string;
}

export const InputNumber: React.FC<InputNumberProps> = ({
  name,
  requiredMsg = 'This field is required',
  label,
  hidden,
  suffix,
  min,
  max,
  placeholder,
  required,
  disabled
}) => {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div hidden={hidden} className="candy-form-input-number">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        className={errors[name] ? 'candy-form-input-number-invalid' : ''}
        id={name}
        type="number"
        {...register(name, { required: required && requiredMsg, min, max, disabled })}
        placeholder={placeholder}
        step="any"
        onWheel={(e) => e.currentTarget.blur()}
      />
      {suffix && <span className="candy-form-input-suffix">{suffix}</span>}
      {errors[name]?.message && <span className="candy-form-error">{errors[name]?.message}</span>}
      {!errors[name]?.message && errors[name]?.type === 'max' && (
        <span className="candy-form-error">Maximum value is {max}</span>
      )}
      {!errors[name]?.message && errors[name]?.type === 'min' && (
        <span className="candy-form-error">Minimum value is {min}</span>
      )}
    </div>
  );
};
