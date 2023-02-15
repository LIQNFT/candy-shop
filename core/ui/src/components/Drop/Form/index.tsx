import React from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { Switch } from 'components/Form/Switch';
import { Checkbox, InputNumber, InputText } from 'components/Form';
import { MasterEditionNft } from '@liqnft/candy-shop-sdk';
import { RedemptionSetting } from './RedemptionSetting';
import { TimeSelection } from './TimeSelection';

import { Show } from 'components/Show';
import { FormType, formDefaultValue, FormKey, TimeRowType } from './Form.utils';
import dayjs from 'dayjs';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(IsSameOrBefore);
dayjs.extend(IsSameOrAfter);
import './style.less';

interface CreateEditionFormProps {
  onSubmit: (...args: any) => void;
  nft: MasterEditionNft;
  formData?: FormType;
  onBack: () => void;
  currencySymbol: string;
}

export const CreateEditionForm: React.FC<CreateEditionFormProps> = ({
  onSubmit,
  nft,
  formData,
  onBack,
  currencySymbol
}) => {
  const methods = useForm({
    defaultValues: formData || { ...formDefaultValue, name: nft.name, totalSupply: nft.maxSupply }
  });

  const { handleSubmit, setError } = methods;

  const onSubmitForm = (data: FormType) => {
    const NOW = dayjs();

    const startTime = dayjs(data.saleStartDate)
      .add((Number(data.saleStartHour) % 12) + (data.saleStartTimeFormat === 'PM' ? 12 : 0), 'hour')
      .add(Number(data.saleStartMinute), 'minute');

    const endTime = dayjs(data.saleEndDate)
      .add((Number(data.saleEndHour) % 12) + (data.saleEndTimeFormat === 'PM' ? 12 : 0), 'hour')
      .add(Number(data.saleEndMinute), 'minute');

    if (startTime.isSameOrBefore(NOW)) {
      return setError(FormKey.saleStartDate, { message: 'Sale start time must be > current time.' });
    }

    if (data.whitelistRelease) {
      const whitelistDate = dayjs(data.whitelistDate)
        .add((Number(data.whitelistHour) % 12) + (data.whitelistTimeFormat === 'PM' ? 12 : 0), 'hour')
        .add(Number(data.whitelistMinute), 'minute');

      if (whitelistDate.isSameOrAfter(startTime)) {
        return setError(FormKey.whitelistDate, { message: 'Whitelist time must be < Sale start time.' });
      }

      if (whitelistDate.isSameOrBefore(NOW)) {
        return setError(FormKey.whitelistDate, { message: 'Whitelist time must be > current time.' });
      }
    }

    if (!data.salesPeriodZero && startTime.isSameOrAfter(endTime)) {
      return setError(FormKey.saleEndDate, { message: 'Sale end time must be > Sale start time.' });
    }

    onSubmit({ ...data, name: nft.name, totalSupply: nft.maxSupply });
  };

  const salesPeriodZero = useWatch({ control: methods.control, name: FormKey.salesPeriodZero });
  const whitelistRelease = useWatch({ control: methods.control, name: FormKey.whitelistRelease });

  return (
    <FormProvider {...methods}>
      <form id="edition-form" className="candy-edition-form" onSubmit={handleSubmit(onSubmitForm)}>
        <p className="candy-subTitle">Enter details on your new edition drop</p>

        <InputText
          name={FormKey.name}
          placeholder="Enter Drop Name"
          label="Drop Name"
          labelTip="Display name for this NFT drop"
          disabled
        />

        <TimeSelection type={TimeRowType.saleStart} />
        <TimeSelection type={TimeRowType.saleEnd} disabled={salesPeriodZero} />

        <Switch name={FormKey.salesPeriodZero}>Sale ends when all NFTs have been sold out</Switch>

        <div className="candy-edition-form-price">
          <InputNumber
            name={FormKey.totalSupply}
            label="Total Supply"
            labelTip="Maximum number of editions to be created - based on Metaplex max supply attribute"
          />
          <InputNumber
            name={FormKey.mintPrice}
            label="Mint Price"
            labelTip="Price of each edition drop"
            suffix={<span className="candy-edition-form-sol">{currencySymbol}</span>}
            placeholder="0"
            required
          />
        </div>

        {/** Redemption view */}
        <RedemptionSetting />

        {/** Whitelist view */}
        <Checkbox
          id={FormKey.whitelistRelease}
          labelTip="By checking this box, you will create a whitelist process for this drop. You will need to produce your own whitelist SPL token and provide the address below - users that mint this drop will need to hold a whitelist token to mint during the whitelist presale period"
          label="Whitelist Release"
        />

        <Show when={whitelistRelease}>
          <div className="candy-edition-form-item">
            <InputText
              required
              name={FormKey.whitelistAddress}
              placeholder="Enter Token Mint Address"
              label="Whitelist Token Mint Address"
              labelTip="Public key of the whitelist token mint"
            />
          </div>
          <TimeSelection type={TimeRowType.whitelist} />
        </Show>

        <div className="candy-edition-buttons">
          <button className="candy-button candy-button-default" onClick={onBack} type="button">
            Back
          </button>
          <input className="candy-button" id="edition-form-btn-submit" type="submit" value="Continue" />
        </div>
      </form>
    </FormProvider>
  );
};
