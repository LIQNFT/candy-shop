import React from 'react';

import { InputNumber } from 'components/Form';
import { TimeRowType, TimeFormItems } from './Form.utils';

import { useFormContext, useWatch } from 'react-hook-form';
import { DatePicker } from 'components/Form/DatePicker';

import dayjs from 'dayjs';
import './style.less';

interface TimeSelectionProps {
  type: TimeRowType;
  hidden?: boolean;
  disabled?: boolean;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({ type, hidden, disabled }) => {
  const rowInfo = TimeFormItems[type];

  const getFormatTimeButtonClassName = (isActive: boolean) =>
    `candy-edition-radio ${isActive ? '' : 'candy-edition-radio-disable'}`;

  const { setValue, register } = useFormContext();

  const onChangeTimeFormat = (format: 'AM' | 'PM') => () => {
    setValue(rowInfo.timeFormatKey, format);
  };
  const timeFormat = useWatch({ name: rowInfo.timeFormatKey });

  return (
    <div className={`candy-edition-sale-time${disabled ? ' candy-edition-sale-time-disabled' : ''}`} hidden={hidden}>
      <DatePicker
        name={rowInfo.dateKey}
        label={rowInfo.dateLabel}
        labelTip={rowInfo.dateLabelTip}
        min={dayjs().format('YYYY-MM-DD')}
      />
      <InputNumber name={rowInfo.hourKey} label={rowInfo.hourLabel} required min={1} max={12} />
      <span className="candy-edition-sale-time-colon">:</span>
      <InputNumber name={rowInfo.minuteKey} min={0} max={59} />

      <button
        className={getFormatTimeButtonClassName(timeFormat === 'AM')}
        onClick={onChangeTimeFormat('AM')}
        type="button"
      >
        {'AM'}
      </button>

      <button
        className={getFormatTimeButtonClassName(timeFormat === 'PM')}
        onClick={onChangeTimeFormat('PM')}
        type="button"
      >
        {'PM'}
      </button>

      <input {...register(rowInfo.timeFormatKey, { required: true })} hidden />
    </div>
  );
};
