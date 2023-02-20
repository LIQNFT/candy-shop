import React from 'react';

import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Checkbox } from 'components/Form';
import { BIDDING_WINDOWS } from './Form.utils';

import './style.less';

export const ExtensionBidding = () => {
  const { register, setValue } = useFormContext();
  const { errors } = useFormState();

  const value = useWatch({ name: 'extensionPeriod' });
  const isDisableBiddingExtension = useWatch({ name: 'disableBiddingExtension' });

  return (
    <>
      <Checkbox id="disableBiddingExtension" label="Disable Automatic Bid Extension" />

      <div className="candy-auction-period" hidden={isDisableBiddingExtension}>
        <label>Select Final Bidding Window</label>
        <div className="candy-auction-period-extension">
          {BIDDING_WINDOWS.map((item) => (
            <button
              key={item.value}
              className={`candy-auction-radio ${value === item.value ? '' : 'candy-auction-radio-disable'}`}
              onClick={() => setValue('extensionPeriod', item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          {...register('extensionPeriod', {
            required: !isDisableBiddingExtension
          })}
          hidden
        />
        {errors['extensionPeriod'] && <span className="candy-form-error">Please select bidding period extension</span>}
      </div>
    </>
  );
};
