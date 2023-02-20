import { Tooltip } from 'components/Tooltip';
import React from 'react';
import { RegisterOptions, useFormContext, useWatch } from 'react-hook-form';

import './style.less';

interface InputTextProps {
  label?: string;
  labelTip?: string;
  name: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  value?: string;
  onChangeInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: HTMLInputElement['type'];
  showMaxLength?: boolean;
  title?: string;
  hidden?: boolean;
  className?: string;
  requiredMsg?: string;
  pattern?: RegisterOptions['pattern'];
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  labelTip,
  name,
  placeholder,
  maxLength,
  showMaxLength,
  disabled,
  required,
  type,
  title,
  hidden,
  className = '',
  requiredMsg = 'This field is required',
  pattern
}) => {
  const {
    register,
    formState: { errors }
  } = useFormContext();
  const value = useWatch({ name });

  return (
    <div hidden={hidden} className={`candy-form-input ${className}`}>
      <label htmlFor={name}>
        {label}
        {labelTip && (
          <Tooltip inner={labelTip}>
            <span className="candy-icon-question" />
          </Tooltip>
        )}
      </label>
      <input
        title={title}
        id={name}
        {...register(name, {
          required: required && requiredMsg,
          disabled,
          maxLength,
          pattern
        })}
        placeholder={placeholder}
        type={type}
      />
      {showMaxLength && maxLength && (
        <span className="candy-form-input-character-limit">
          <span>{value.length || 0}</span>/{maxLength}
        </span>
      )}
      {errors[name]?.message && <span className="candy-form-error">{errors[name]?.message}</span>}
    </div>
  );
};
