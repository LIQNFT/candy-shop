import React, { useState } from 'react';

// import { IconTick } from 'assets/IconTick';
import { Checkbox } from 'components/Checkbox';
import { AuctionNft } from 'components/AuctionNft';

import './style.less';

interface AuctionFormProps {
  onSubmit: () => void;
}

enum CheckEnum {
  PERIOD = 'period',
  CLOCK_FORMAT = 'clock_format',
  BUY_NOW = 'buy_now',
  START_NOW = 'start_now'
}

export const AuctionForm: React.FC<AuctionFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<any>({
    auction_bid: '',
    auction_price: ''
  });

  const onCheck = (key: CheckEnum, value?: any) => (e: any) => {
    e.preventDefault();
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const onCheckbox = (key: CheckEnum) => (e: any) => {
    e.preventDefault();
    setForm((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();
    console.log({ form });

    onSubmit();
  };

  return (
    <form className="candy-auction-form" onSubmit={onSubmitForm}>
      <div className="candy-auction-form-title">Auction Details</div>
      <AuctionNft name="NFT_name" collection="collection" imgUrl={imgUrl} />

      <div className="candy-auction-form-item">
        <label htmlFor="auction_bid">Enter starting bid</label>
        <input
          id="auction_bid"
          type="number"
          placeholder="0,0"
          required
          min={0}
          value={form['auction_bid']}
          onChange={onChangeInput}
        />
        <span className="candy-auction-form-sol">SOL</span>
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
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Period is required.')}
        />
      </div>

      <Checkbox
        onClick={onCheckbox(CheckEnum.BUY_NOW)}
        checked={Boolean(form[CheckEnum.BUY_NOW])}
        id="auction-buy-now"
        label="Enable buy now"
      />

      <div className="candy-auction-form-item">
        <label htmlFor="auction_price">Enter buy now price</label>
        <input
          id="auction_price"
          type="number"
          placeholder="0,0"
          required
          min={0}
          value={form['auction_price']}
          onChange={onChangeInput}
        />
        <span className="candy-auction-form-sol">SOL</span>
      </div>
      <div className="candy-action-form-fees">
        <div>Fees</div>
        <div>1.5%</div>
      </div>

      <Checkbox
        onClick={onCheckbox(CheckEnum.START_NOW)}
        checked={Boolean(form[CheckEnum.START_NOW])}
        id="auction-start-now"
        label="Start Immediately"
      />

      <div className="candy-auction-form-item">
        <label htmlFor="auction_date">Enter starting bid</label>
        <input id="auction_date" type="date" required />
      </div>

      <label htmlFor="auction_hour" className="candy-auction-time-label">
        Time
      </label>
      <div className="candy-auction-form-time">
        <input
          id="auction_hour"
          type="number"
          min={0}
          max={24}
          required
          value={form['auction_hour']}
          onChange={onChangeInput}
        />
        <span>:</span>
        <input
          id="auction_minute"
          type="number"
          min={0}
          max={59}
          required
          value={form['auction_minute']}
          onChange={onChangeInput}
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
            required
            value={form[CheckEnum.CLOCK_FORMAT]}
            className="candy-auction-input-hidden"
            id="auction_clock_format"
            name="auction_clock_format"
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Clock format is required.')}
          />
        </div>
      </div>

      <input className="candy-button" type="submit" value="NEXT" />
    </form>
  );
};

const imgUrl =
  'https://lhotgeeogrlhabitqqgfjmtxhtt2v3caww7nk2gq47gvugkky2sa.arweave.net/Wd0zEI40VnAFE4QMVLJ3POeq7EC1vtVo0OfNWhlKxqQ?ext=png';

const PERIODS = [
  { label: '1 Hour', value: 1 },
  { label: '6 Hour', value: 6 },
  { label: '12 Hour', value: 12 },
  { label: '24 Hour', value: 24 },
  { label: '48 Hour', value: 48 }
];
