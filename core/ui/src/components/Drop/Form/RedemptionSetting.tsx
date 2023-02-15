import React, { useEffect } from 'react';

import { Checkbox, InputText } from 'components/Form';
import { FormType, FormKey } from './Form.utils';

import { useFormContext, useWatch } from 'react-hook-form';
import { Show } from 'components/Show';
import { DROP_USER_INPUT_SCHEMA } from 'constant/drop';

import './style.less';

export const RedemptionSetting: React.FC = () => {
  const hasRedemption = useWatch({ name: FormKey.hasRedemption });
  const inputSchema = useWatch({ name: FormKey.inputSchema }) as FormType['inputSchema'];
  const { setValue } = useFormContext();

  useEffect(() => {
    DROP_USER_INPUT_SCHEMA.forEach((item) => setValue(`item-redemption-${item.name}`, true));
  }, [setValue]);

  return (
    <>
      <Checkbox
        id={FormKey.hasRedemption}
        labelTip="By checking this box, you will create edition redemption for this NFT"
        label="Item Redemption"
      />

      <Show when={hasRedemption}>
        <InputText
          name={FormKey.description}
          placeholder="Enter Drop Description"
          label="Drop Description"
          labelTip="Display description for this NFT drop"
          maxLength={200}
          showMaxLength
        />

        <div className="candy-edition-redemption">
          <div>
            {DROP_USER_INPUT_SCHEMA.map((schema) => {
              return (
                <Checkbox
                  key={schema.name}
                  disabled={schema.required}
                  id={'item-redemption-' + schema.name}
                  label={schema.label}
                />
              );
            })}
          </div>
          <div className="candy-edition-redemption-preview">
            <b>Preview</b>
            {inputSchema?.map((schema) => {
              return (
                <InputText
                  key={schema.name}
                  name={schema.name}
                  label={schema.label}
                  disabled
                  required={false}
                  placeholder="User input here"
                />
              );
            })}

            <button className="candy-button candy-button-outlined" type="button">
              Submit
            </button>
          </div>
        </div>
      </Show>
    </>
  );
};
