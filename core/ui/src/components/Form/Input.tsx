import { Tooltip } from 'components/Tooltip';
import React, { useState } from 'react';

import './style.less';

interface InputTextProps {
  label: string;
  labelTip?: string;
  name: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  value?: string;
  onChangeInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: HTMLInputElement['type'];
  pattern?: string;
  showMaxLength?: boolean;
  title?: string;
  hidden?: boolean;
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  labelTip,
  name,
  placeholder,
  maxLength,
  showMaxLength,
  disabled,
  value,
  onChangeInput,
  required,
  type,
  pattern,
  title,
  hidden
}) => {
  const [count, setCount] = useState(0);

  return (
    <div hidden={hidden} className="candy-form-input">
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
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (showMaxLength && maxLength) setCount(event.target.value.length);
          return onChangeInput && onChangeInput(event);
        }}
        disabled={disabled}
        maxLength={maxLength}
        type={type}
        pattern={pattern}
      />
      {showMaxLength && maxLength && (
        <span className="candy-form-input-character-limit">
          <span>{count}</span>/{maxLength}
        </span>
      )}
    </div>
  );
};
