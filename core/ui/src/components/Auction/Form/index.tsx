import React from 'react';

import { AuctionNftHeader } from '../AuctionNftHeader';

import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { InputNumber, Checkbox } from 'components/Form';
import { Show } from 'components/Show';
import { DatePicker } from 'components/Form/DatePicker';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
import './style.less';
import { ExtensionBidding } from './ExtensionBidding';
import { AuctionFormProps, formDefaultValues, FormType } from './Form.utils';
import { TimeFormat } from './TimeFormat';

export const AuctionForm: React.FC<AuctionFormProps> = ({
  onSubmit,
  currencySymbol,
  fee,
  nft,
  auctionForm,
  onBack,
  showExtensionBidding
}) => {
  const methods = useForm<FormType>({
    values: auctionForm || formDefaultValues
  });
  const { handleSubmit, setError } = methods;

  const onSubmitForm = (data: FormType) => {
    const NOW = dayjs();
    // startDate

    const startDate = data.startNow
      ? NOW
      : dayjs(data.startDate)
          .add((Number(data.startHour) % 12) + (data.startClockFormat === 'PM' ? 12 : 0), 'hour')
          .add(Number(data.startMinute), 'minute');

    if (startDate.isBefore(NOW)) {
      return setError('startDate', { message: `Start time must be > current time.` }, { shouldFocus: true });
    }

    if (data.endHour === '12') data.endHour = '0';
    const endDate = dayjs(data.endDate)
      .add((Number(data.endHour) % 12) + (data.endClockFormat === 'PM' ? 12 : 0), 'hour')
      .add(Number(data.endMinute), 'minute');

    if (endDate.isSameOrBefore(startDate)) {
      return setError('endDate', { message: `End time must be > start time.` }, { shouldFocus: true });
    }

    const biddingPeriod = endDate.diff(startDate, 'second');

    onSubmit({ ...data, biddingPeriod });
  };

  const isEnableBuyNow = useWatch({ name: 'buyNow', control: methods.control });
  const isStartNow = useWatch({ name: 'startNow', control: methods.control });

  return (
    <FormProvider {...methods}>
      <form className="candy-auction-form" id="auction-form" onSubmit={handleSubmit(onSubmitForm)}>
        <AuctionNftHeader
          name={nft.metadata?.data.name}
          ticker={nft.metadata?.data.symbol}
          imgUrl={nft.nftImage}
          edition={nft.edition}
        />

        <InputNumber
          name="startingBid"
          required
          requiredMsg="Starting Bid must be greater than 0."
          label="Starting Bid"
          suffix={currencySymbol}
          min={0}
        />
        <InputNumber
          name="tickSize"
          required
          requiredMsg="Minimum Incremental Bid must be greater than 0."
          label="Minimum Incremental Bid"
          suffix={currencySymbol}
        />

        <div className="candy-action-form-fees">
          <div>Fees</div>
          <div>{fee ? `${fee.toFixed(1)}%` : 'n/a'} </div>
        </div>

        <Checkbox id={'buyNow'} label="Enable buy now" />
        <InputNumber
          hidden={!isEnableBuyNow}
          name="buyNowPrice"
          required={isEnableBuyNow}
          label="Enter buy now price"
          suffix={currencySymbol}
        />

        <Show when={showExtensionBidding}>
          <ExtensionBidding />
        </Show>

        <Checkbox id={'startNow'} label="Start immediately" />

        <Show when={!isStartNow}>
          <div>
            <DatePicker name="startDate" label="Auction start date" />
            <div className="candy-auction-form-time">
              <InputNumber name="startHour" required min={1} max={12} />
              <span>:</span>
              <InputNumber name="startMinute" required placeholder="00" min={0} max={59} />
              <TimeFormat name="startClockFormat" />
            </div>
          </div>
        </Show>
        <div>
          <DatePicker name="endDate" label="Auction end date" min={dayjs().format('YYYY-MM-DD')} />
          <div className="candy-auction-form-time">
            <InputNumber name="endHour" required min={1} max={12} />
            <span>:</span>
            <InputNumber name="endMinute" required min={0} max={59} />
            <TimeFormat name="endClockFormat" />
          </div>
        </div>

        <div className="candy-auction-confirm-button-container">
          <button type="button" className="candy-button candy-button-default" onClick={onBack}>
            Back
          </button>
          <input className="candy-button" type="submit" value="Continue" />
        </div>
      </form>
    </FormProvider>
  );
};
