import React, { useState, useEffect } from 'react';

import { Checkbox } from 'components/Checkbox';
import { AuctionNftHeader } from '../AuctionNftHeader';

import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './style.less';
import { EMPTY_FUNCTION } from 'utils/helperFunc';
import { convertTime12to24 } from 'utils/timer';

interface AuctionFormProps {
  onSubmit: (...args: any) => void;
  currencySymbol?: string;
  fee?: number;
  nft: SingleTokenInfo;
  auctionForm?: FormType;
  onBack: () => void;
  showExtensionBidding: boolean;
}

enum CheckEnum {
  PERIOD = 'biddingPeriod',
  CLOCK_FORMAT = 'clockFormat',
  BUY_NOW = 'buyNow',
  START_NOW = 'startNow',
  DISABLE_BIDDING_EXTENSION = 'disableBiddingExtension',
  EXTENSION_PERIOD = 'extensionPeriod'
}

export type FormType = {
  startingBid: string;
  buyNowPrice: string;
  biddingPeriod: number;
  clockFormat: 'PM' | 'AM';
  auctionHour: string;
  auctionMinute: string;
  buyNow?: boolean;
  startNow?: boolean;
  startDate: string;
  tickSize: string;
  disableBiddingExtension: boolean;
  extensionPeriod: string;
};

const VALIDATE_MESSAGE: { [key: string]: string } = {
  startingBid: 'Starting Bid must be greater than 0.',
  tickSize: 'Minimum Incremental Bid must be greater than 0.',
  buyNowPrice: 'Buy Now Price must be greater than 0.',
  extensionPeriod: ''
};

const validateInput = (nodeId: string, message: string) => {
  (document.getElementById(nodeId) as HTMLInputElement)?.setCustomValidity(message);
};

const reportValidity = () => {
  (document.getElementById('auction-form') as HTMLFormElement).reportValidity();
};

const onResetValidation = () => {
  Object.keys(VALIDATE_MESSAGE).forEach((nodeId) =>
    (document.getElementById(nodeId) as HTMLInputElement)?.setCustomValidity('')
  );
  (document.getElementById('startDate') as HTMLInputElement)?.setCustomValidity('');
};

export const AuctionForm: React.FC<AuctionFormProps> = ({
  onSubmit,
  currencySymbol,
  fee,
  nft,
  auctionForm,
  onBack,
  showExtensionBidding
}) => {
  const [form, setForm] = useState<FormType>({
    startingBid: '',
    tickSize: '',
    buyNowPrice: '',
    biddingPeriod: 24,
    clockFormat: 'AM',
    auctionHour: '12',
    auctionMinute: '00',
    startNow: false,
    buyNow: false,
    startDate: dayjs().add(1, 'd').format('YYYY-MM-DD'),
    disableBiddingExtension: false,
    extensionPeriod: ''
  });

  const onCheck = (key: CheckEnum, value?: any) => (e: any) => {
    e.preventDefault();
    onResetValidation();
    setForm((prev: FormType) => ({ ...prev, [key]: value }));
  };

  const onCheckbox = (key: CheckEnum) => (e: any) => {
    e.preventDefault();
    onResetValidation();
    setForm((prev: FormType) => ({ ...prev, [key]: !prev[key] }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onResetValidation();
    const { value, name } = e.target as { value: any; name: keyof FormType };
    if (name !== 'startDate') {
      validateInput(name, Number(value) > 0 ? '' : VALIDATE_MESSAGE[name]);
    }
    if (name === 'buyNowPrice' && form.buyNow) {
      const minBuyNowPrice = Number(form.startingBid) + Number(form.tickSize);

      validateInput(
        name,
        Number(value) > minBuyNowPrice ? '' : `Buy Now Price must be greater than ${minBuyNowPrice}.`
      );
    }
    setForm((prev: FormType) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();

    const VALIDATES: { nodeId: keyof FormType; trigger: boolean }[] = [
      { nodeId: 'startingBid', trigger: true },
      { nodeId: 'tickSize', trigger: true },
      { nodeId: 'buyNowPrice', trigger: Boolean(form.buyNow) }
    ];

    if (
      VALIDATES.some(({ nodeId, trigger }) => {
        if (!trigger) return false;
        if (form[nodeId] === '') {
          return true;
        }
        return Number(form[nodeId]) <= 0;
      })
    ) {
      return;
    }

    const NOW = dayjs().unix();

    const startDate = dayjs(
      `${form.startDate} ${convertTime12to24(form.auctionHour, form.auctionMinute, form.clockFormat)} UTC`
    ).unix();

    if (startDate <= NOW) {
      validateInput('startDate', `Start time must be > current time.`);
      return reportValidity();
    }

    onSubmit(form);
  };

  const preventUpdateNumberOnWheel = (e: any) => {
    e.preventDefault();
    e.currentTarget.blur();
  };

  useEffect(() => {
    if (auctionForm) setForm(auctionForm);
  }, [auctionForm]);

  return (
    <form className="candy-auction-form" id="auction-form" onSubmit={onSubmitForm}>
      <AuctionNftHeader
        name={nft.metadata?.data.name}
        ticker={nft.metadata?.data.symbol}
        imgUrl={nft.nftImage}
        edition={nft.edition}
      />

      <div className="candy-auction-form-item">
        <label htmlFor="startingBid">Starting Bid</label>
        <input
          id="startingBid"
          name="startingBid"
          type="number"
          placeholder="0"
          required
          min={0}
          value={form['startingBid']}
          onChange={onChangeInput}
          onWheel={preventUpdateNumberOnWheel}
          step="any"
        />
        <span className="candy-auction-form-sol">{currencySymbol}</span>
      </div>

      <div className="candy-auction-form-item">
        <label htmlFor="tickSize">Minimum Incremental Bid</label>
        <input
          id="tickSize"
          name="tickSize"
          type="number"
          placeholder="0"
          required
          min={0}
          value={form['tickSize']}
          onChange={onChangeInput}
          onWheel={preventUpdateNumberOnWheel}
          step="any"
        />
        <span className="candy-auction-form-sol">{currencySymbol}</span>
      </div>

      <div className="candy-action-form-fees">
        <div>Fees</div>
        <div>{fee ? `${fee.toFixed(1)}%` : 'n/a'} </div>
      </div>

      <Checkbox
        onClick={onCheckbox(CheckEnum.BUY_NOW)}
        checked={Boolean(form[CheckEnum.BUY_NOW])}
        id={CheckEnum.BUY_NOW}
        label="Enable buy now"
      />

      <div className="candy-auction-form-item" style={{ display: form[CheckEnum.BUY_NOW] ? 'flex' : 'none' }}>
        <label htmlFor="buyNowPrice">Enter buy now price</label>
        <input
          id="buyNowPrice"
          name="buyNowPrice"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder="0"
          required={form[CheckEnum.BUY_NOW]}
          min={form['startingBid'] || 0}
          value={form['buyNowPrice']}
          onChange={onChangeInput}
          step="any"
        />
        <span className="candy-auction-form-sol">{currencySymbol}</span>
      </div>

      <div className="candy-auction-period">
        <label>Bidding period</label>
        <div>
          {PERIODS.map((item: any) => (
            <button
              key={item.value}
              className={`candy-auction-radio ${
                form[CheckEnum.PERIOD] === item.value ? '' : 'candy-auction-radio-disable'
              }`}
              onClick={onCheck(CheckEnum.PERIOD, item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          required
          value={form[CheckEnum.PERIOD]}
          className="candy-auction-input-hidden"
          id="auction_period"
          name="auction_period"
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Period is required.')}
          onChange={EMPTY_FUNCTION}
        />
      </div>

      {showExtensionBidding && (
        <>
          <Checkbox
            onClick={onCheckbox(CheckEnum.DISABLE_BIDDING_EXTENSION)}
            checked={Boolean(form[CheckEnum.DISABLE_BIDDING_EXTENSION])}
            id={CheckEnum.DISABLE_BIDDING_EXTENSION}
            label="Disable Automatic Bid Extension"
          />
          <div
            className="candy-auction-period"
            style={{ display: form[CheckEnum.DISABLE_BIDDING_EXTENSION] ? 'none' : 'block' }}
          >
            <label>Select Final Bidding Window</label>

            <div className="candy-auction-period-extension">
              {BIDDING_WINDOWS.map((item) => (
                <button
                  key={item.value}
                  className={`candy-auction-radio ${
                    form[CheckEnum.EXTENSION_PERIOD] === item.value ? '' : 'candy-auction-radio-disable'
                  }`}
                  onClick={onCheck(CheckEnum.EXTENSION_PERIOD, item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <input
            className="candy-auction-input-hidden"
            style={{ width: '10px', height: '1px' }}
            required={!form[CheckEnum.DISABLE_BIDDING_EXTENSION]}
            value={form[CheckEnum.EXTENSION_PERIOD]}
            id={CheckEnum.EXTENSION_PERIOD}
            name={CheckEnum.EXTENSION_PERIOD}
            onInvalid={(e) => {
              (e.currentTarget as HTMLInputElement).setCustomValidity('Bidding Window is required.');
            }}
            onChange={EMPTY_FUNCTION}
          />
        </>
      )}

      <Checkbox
        onClick={onCheckbox(CheckEnum.START_NOW)}
        checked={Boolean(form[CheckEnum.START_NOW])}
        id={CheckEnum.START_NOW}
        label="Start immediately"
      />

      <div style={{ display: form[CheckEnum.START_NOW] ? 'none' : 'block' }}>
        <div className="candy-auction-form-item">
          <label htmlFor="startDate">Auction start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required={!form[CheckEnum.START_NOW]}
            onChange={onChangeInput}
            value={form['startDate']}
            min={dayjs.utc().format('YYYY-MM-DD')}
          />
        </div>

        <label htmlFor="auctionHour" className="candy-auction-time-label">
          Auction start time (UTC)
        </label>
        <div className="candy-auction-form-time">
          <input
            id="auctionHour"
            name="auctionHour"
            type="number"
            onWheel={preventUpdateNumberOnWheel}
            placeholder={'1'}
            min={1}
            max={12}
            required={!form[CheckEnum.START_NOW]}
            value={form['auctionHour']}
            onChange={onChangeInput}
            maxLength={2}
            step="any"
          />
          <span>:</span>
          <input
            id="auctionMinute"
            name="auctionMinute"
            type="number"
            onWheel={preventUpdateNumberOnWheel}
            placeholder={'00'}
            min={0}
            max={59}
            required={!form[CheckEnum.START_NOW]}
            value={form['auctionMinute']}
            onChange={onChangeInput}
            maxLength={2}
            step="any"
            onBlur={() => {
              const num = Number(form['auctionMinute']);
              setForm((form) => ({ ...form, ['auctionMinute']: num >= 10 ? `${num}` : `0${num}` }));
            }}
          />
          <div className="candy-auction-time-checkbox">
            <button
              className={`candy-auction-radio ${
                form[CheckEnum.CLOCK_FORMAT] === 'AM' ? '' : 'candy-auction-radio-disable'
              }`}
              onClick={onCheck(CheckEnum.CLOCK_FORMAT, 'AM')}
            >
              AM
            </button>
            <button
              className={`candy-auction-radio ${
                form[CheckEnum.CLOCK_FORMAT] === 'PM' ? '' : 'candy-auction-radio-disable'
              }`}
              onClick={onCheck(CheckEnum.CLOCK_FORMAT, 'PM')}
            >
              PM
            </button>
            <input
              required={!form[CheckEnum.START_NOW]}
              value={form[CheckEnum.CLOCK_FORMAT]}
              className="candy-auction-input-hidden"
              id="auctionClockFormat"
              name="auctionClockFormat"
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Clock format is required.')}
              onChange={EMPTY_FUNCTION}
            />
          </div>
        </div>
      </div>

      <div className="candy-auction-confirm-button-container">
        <button className="candy-button candy-button-default" onClick={onBack}>
          Back
        </button>
        <input className="candy-button" type="submit" value="Continue" />
      </div>
    </form>
  );
};

const PERIODS = [
  { label: '1h', value: 1 },
  { label: '6h', value: 6 },
  { label: '12h', value: 12 },
  { label: '24h', value: 24 },
  { label: '48h', value: 48 }
];
const BIDDING_WINDOWS = [
  { label: '3m', value: '180' },
  { label: '5m', value: '300' },
  { label: '10m', value: '600' },
  { label: '15m', value: '900' }
];
