import React from 'react';

import { useFormContext, useWatch } from 'react-hook-form';

import './style.less';

interface TimeFormatProps {
  name: string;
  required?: boolean;
}

export const TimeFormat: React.FC<TimeFormatProps> = ({ name, required }) => {
  const { setValue, register } = useFormContext();

  const onClick = (value: 'AM' | 'PM') => () => {
    setValue(name, value);
  };

  const timeFormat = useWatch({ name });

  return (
    <div className="candy-auction-time-checkbox">
      <button
        className={`candy-auction-radio ${timeFormat === 'AM' ? '' : 'candy-auction-radio-disable'}`}
        onClick={onClick('AM')}
        type="button"
      >
        AM
      </button>
      <button
        className={`candy-auction-radio ${timeFormat === 'PM' ? '' : 'candy-auction-radio-disable'}`}
        onClick={onClick('PM')}
        type="button"
      >
        PM
      </button>
      <input {...register(name, { required })} hidden />
    </div>
  );
};
