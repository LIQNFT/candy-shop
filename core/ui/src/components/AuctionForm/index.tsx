import React, { useState, useEffect } from 'react';

import { Checkbox } from 'components/Checkbox';
import { AuctionNftHeader } from 'components/AuctionNftHeader';

import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import dayjs from 'dayjs';

import './style.less';

interface AuctionFormProps {
  onSubmit: (...args: any) => void;
  currencySymbol: string;
  fee?: number;
  nft: SingleTokenInfo;
  auctionForm?: FormType;
  onBack: () => void;
}

enum CheckEnum {
  PERIOD = 'bidding_period',
  CLOCK_FORMAT = 'clock_format',
  BUY_NOW = 'buy_now',
  START_NOW = 'start_now'
}

export type FormType = {
  starting_bid: string;
  buy_now_price: string;
  bidding_period: number;
  clock_format: 'PM' | 'AM';
  auction_hour: string;
  auction_minute: string;
  buy_now?: boolean;
  start_now?: boolean;
  start_date: string;
  tickSize: string;
};

export const AuctionForm: React.FC<AuctionFormProps> = ({
  onSubmit,
  currencySymbol,
  fee,
  nft,
  auctionForm,
  onBack
}) => {
  const [form, setForm] = useState<FormType>({
    starting_bid: '',
    tickSize: '',
    buy_now_price: '',
    bidding_period: 24,
    clock_format: 'AM',
    auction_hour: '12',
    auction_minute: '0',
    start_now: false,
    buy_now: false,
    start_date: dayjs().add(1, 'd').format('YYYY-MM-DD')
  });

  const onCheck = (key: CheckEnum, value?: any) => (e: any) => {
    e.preventDefault();
    setForm((prev: FormType) => ({ ...prev, [key]: value }));
  };

  const onCheckbox = (key: CheckEnum) => (e: any) => {
    e.preventDefault();
    setForm((prev: FormType) => ({ ...prev, [key]: !prev[key] }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setForm((prev: FormType) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();
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
    <form className="candy-auction-form" onSubmit={onSubmitForm}>
      <AuctionNftHeader
        name={nft.metadata?.data.name}
        ticker={nft.metadata?.data.symbol}
        imgUrl={nft.nftImage}
        edition={nft.edition}
      />

      <div className="candy-auction-form-item">
        <label htmlFor="starting_bid">Enter starting bid</label>
        <input
          id="starting_bid"
          name="starting_bid"
          type="number"
          placeholder="0"
          required
          min={0}
          value={form['starting_bid']}
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
        id="auction-buy-now"
        label="Enable buy now"
      />

      <div className="candy-auction-form-item" style={{ display: form[CheckEnum.BUY_NOW] ? 'flex' : 'none' }}>
        <label htmlFor="buy_now_price">Enter buy now price</label>
        <input
          id="buy_now_price"
          name="buy_now_price"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder="0"
          required={form[CheckEnum.BUY_NOW]}
          min={form['starting_bid'] || 0}
          value={form['buy_now_price']}
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
          onChange={DO_NOTHING}
        />
      </div>

      <Checkbox
        onClick={onCheckbox(CheckEnum.START_NOW)}
        checked={Boolean(form[CheckEnum.START_NOW])}
        id="start_now"
        label="Start immediately"
      />

      <div style={{ display: form[CheckEnum.START_NOW] ? 'none' : 'block' }}>
        <div className="candy-auction-form-item">
          <label htmlFor="start_date">Auction start date</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required={!form[CheckEnum.START_NOW]}
            onChange={onChangeInput}
            value={form['start_date']}
            min={dayjs().format('YYYY-MM-DD')}
          />
        </div>

        <label htmlFor="auction_hour" className="candy-auction-time-label">
          Auction start time (UTC)
        </label>
        <div className="candy-auction-form-time">
          <input
            id="auction_hour"
            name="auction_hour"
            type="number"
            onWheel={preventUpdateNumberOnWheel}
            placeholder={'1'}
            min={1}
            max={12}
            required={!form[CheckEnum.START_NOW]}
            value={form['auction_hour']}
            onChange={onChangeInput}
            maxLength={2}
            step="any"
          />
          <span>:</span>
          <input
            id="auction_minute"
            name="auction_minute"
            type="number"
            onWheel={preventUpdateNumberOnWheel}
            placeholder={'0'}
            min={0}
            max={59}
            required={!form[CheckEnum.START_NOW]}
            value={form['auction_minute']}
            onChange={onChangeInput}
            maxLength={2}
            step="any"
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
              id="auction_clock_format"
              name="auction_clock_format"
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Clock format is required.')}
              onChange={DO_NOTHING}
            />
          </div>
        </div>
      </div>

      <div className="candy-auction-confirm-button-container">
        <span onClick={onBack}>Back</span>
        <input className="candy-button" type="submit" value="Continue" />
      </div>
    </form>
  );
};

const DO_NOTHING = () => {
  //
};

const PERIODS = [
  { label: '1h', value: 1 },
  { label: '6h', value: 6 },
  { label: '12h', value: 12 },
  { label: '24h', value: 24 },
  { label: '48h', value: 48 }
];
