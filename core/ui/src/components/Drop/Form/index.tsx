import React, { useState, useEffect } from 'react';

import { Checkbox } from 'components/Checkbox';
import { EMPTY_FUNCTION } from 'utils/helperFunc';

import { Tooltip } from 'components/Tooltip';
import { EditionDrop } from '@liqnft/candy-shop-sdk';
import { convertTime12to24 } from 'utils/timer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(utc);
dayjs.extend(IsSameOrBefore);
dayjs.extend(IsSameOrAfter);
import './style.less';

interface CreateEditionFormProps {
  onSubmit: (...args: any) => void;
  nft: EditionDrop;
  formData?: FormType;
  onBack: () => void;
  currencySymbol: string;
}

enum CheckEnum {
  release = 'whitelistRelease',
  whitelistTimeFormat = 'whitelistTimeFormat',
  launchTimeFormat = 'launchTimeFormat'
}

export type FormType = {
  name: string;
  whitelistAddress: string;
  launchTimeFormat: 'PM' | 'AM';
  whitelistTimeFormat: 'PM' | 'AM';
  whitelistHour: string;
  whitelistMinute: string;
  whitelistDate: string;
  launchHour: string;
  launchMinute: string;
  launchDate: string;
  totalSupply: number;
  mintPrice: string;
  whitelistRelease: boolean;
  salesPeriod: string;
};

const validateInput = (nodeId: keyof FormType, message: string) => {
  (document.getElementById(nodeId) as HTMLInputElement)?.setCustomValidity(message);
};
const reportValidity = () => {
  (document.getElementById('edition-form') as HTMLFormElement).reportValidity();
};

export const CreateEditionForm: React.FC<CreateEditionFormProps> = ({
  onSubmit,
  nft,
  formData,
  onBack,
  currencySymbol
}) => {
  const [form, setForm] = useState<FormType>(() => {
    const getHour = () => {
      const hour = dayjs.utc().hour();
      if (hour === 0) return '12';
      if (hour > 12) return (hour - 12).toString();
      return hour.toString();
    };
    return {
      name: nft.name,
      whitelistAddress: '',
      launchTimeFormat: 'AM',
      whitelistTimeFormat: dayjs.utc().hour() >= 12 ? 'PM' : 'AM',
      launchHour: '12',
      launchMinute: '00',
      whitelistHour: getHour(),
      whitelistMinute: dayjs.utc().minute().toString(),
      launchDate: dayjs.utc().add(1, 'd').format('YYYY-MM-DD'),
      whitelistDate: dayjs.utc().format('YYYY-MM-DD'),
      totalSupply: nft.maxSupply,
      mintPrice: '',
      whitelistRelease: false,
      salesPeriod: ''
    };
  });

  const onResetValidation = () => {
    validateInput('launchDate', '');
    validateInput('whitelistDate', '');
  };

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
    const { value, name } = e.target as { value: any; name: keyof FormType };
    onResetValidation();
    setForm((prev: FormType) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();

    const NOW = dayjs();

    const startTime = dayjs(
      `${form.launchDate} ${convertTime12to24(form.launchHour, form.launchMinute, form.launchTimeFormat)} UTC`
    );

    if (form.whitelistRelease) {
      const whitelistDate = dayjs(
        `${form.whitelistDate} ${convertTime12to24(
          form.whitelistHour,
          form.whitelistMinute,
          form.whitelistTimeFormat
        )} UTC`
      );

      if (whitelistDate.isSameOrBefore(NOW)) {
        validateInput('whitelistDate', 'Whitelist time must be > current time.');
        return reportValidity();
      }

      if (whitelistDate.isSameOrAfter(startTime)) {
        validateInput('whitelistDate', 'Whitelist time must be < Launch time.');
        return reportValidity();
      }
    }

    if (startTime.isSameOrBefore(NOW)) {
      validateInput('launchDate', 'Launch time must be > current time.');
      return reportValidity();
    }

    onSubmit(form);
  };

  const preventUpdateNumberOnWheel = (e: any) => {
    e.preventDefault();
    e.currentTarget.blur();
  };

  useEffect(() => {
    if (formData) setForm(formData);
  }, [formData]);

  const getFormatTimeButtonClassName = (isActive: boolean) =>
    `candy-edition-radio ${isActive ? '' : 'candy-edition-radio-disable'}`;

  return (
    <form id="edition-form" className="candy-edition-form" onSubmit={onSubmitForm}>
      <p className="candy-subTitle">Enter details on your new edition drop</p>
      <div className="candy-edition-form-item">
        <label htmlFor="name">
          Drop Name
          <Tooltip inner="Display name for this NFT drop">
            <span className="candy-icon-question" />
          </Tooltip>
        </label>
        <input
          id="name"
          name="name"
          placeholder="Enter Drop name"
          required
          value={form['name']}
          onChange={onChangeInput}
          disabled
        />
      </div>
      <div className="candy-edition-form-item">
        <label htmlFor="launchDate">
          Public Launch Date
          <Tooltip inner="Date when buyers can publicly mint from this drop">
            <span className="candy-icon-question" />
          </Tooltip>
        </label>
        <input
          id="launchDate"
          name="launchDate"
          type="date"
          onChange={onChangeInput}
          value={form['launchDate']}
          min={dayjs.utc().format('YYYY-MM-DD')}
        />
      </div>

      <label htmlFor="launchHour" className="candy-edition-time-label">
        Public Launch Time
        <Tooltip inner="Time when buyers can publicly mint from this drop">
          <span className="candy-icon-question" />
        </Tooltip>
      </label>
      <div className="candy-edition-form-time">
        <input
          id="launchHour"
          name="launchHour"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'1'}
          min={1}
          max={12}
          required
          value={form['launchHour']}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
        />
        <span>:</span>
        <input
          id="launchMinute"
          name="launchMinute"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'00'}
          min={0}
          max={59}
          required
          value={form['launchMinute']}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
          onBlur={() => {
            const num = Number(form['launchMinute']);
            setForm((form) => ({ ...form, ['launchMinute']: num >= 10 ? `${num}` : `0${num}` }));
          }}
        />
        <div className="candy-edition-time-checkbox">
          <button
            className={getFormatTimeButtonClassName(form[CheckEnum.launchTimeFormat] === 'AM')}
            onClick={onCheck(CheckEnum.launchTimeFormat, 'AM')}
          >
            AM
          </button>
          <button
            className={getFormatTimeButtonClassName(form[CheckEnum.launchTimeFormat] === 'PM')}
            onClick={onCheck(CheckEnum.launchTimeFormat, 'PM')}
          >
            PM
          </button>
          <input
            required={!form[CheckEnum.launchTimeFormat]}
            value={form[CheckEnum.launchTimeFormat]}
            hidden
            id="auctionClockFormat"
            name="auctionClockFormat"
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Clock format is required.')}
            onChange={EMPTY_FUNCTION}
          />
        </div>
      </div>

      <div className="candy-edition-form-item">
        <label htmlFor="salesPeriod" className="candy-edition-time-label">
          Sales Period (mins)
        </label>
        <input
          id="salesPeriod"
          name="salesPeriod"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder="0"
          min={1}
          required
          value={form['salesPeriod']}
          onChange={onChangeInput}
          step="1"
        />
      </div>

      <div className="candy-edition-form-price">
        <div className="candy-edition-form-item">
          <label htmlFor="totalSupply">
            Total Supply
            <Tooltip inner="Maximum number of editions to be created - based on Metaplex max supply attribute">
              <span className="candy-icon-question" />
            </Tooltip>
          </label>
          <input
            id="totalSupply"
            name="totalSupply"
            type="number"
            placeholder="0"
            required
            min={0}
            value={form['totalSupply']}
            onChange={onChangeInput}
            onWheel={preventUpdateNumberOnWheel}
            step="any"
            disabled
          />
        </div>
        <div className="candy-edition-form-item">
          <label htmlFor="mintPrice">
            Mint Price
            <Tooltip inner="Price of each edition drop">
              <span className="candy-icon-question" />
            </Tooltip>
          </label>
          <input
            id="mintPrice"
            name="mintPrice"
            type="number"
            placeholder="0"
            required
            min={0}
            value={form['mintPrice']}
            onChange={onChangeInput}
            onWheel={preventUpdateNumberOnWheel}
            step="any"
          />
          <span className="candy-edition-form-sol">{currencySymbol}</span>
        </div>
      </div>

      <Checkbox
        onClick={onCheckbox(CheckEnum.release)}
        checked={Boolean(form[CheckEnum.release])}
        id="whitelistRelease"
        label={
          <span className="candy-edition-checkbox-label">
            Whitelist Release
            <Tooltip inner="By checking this box, you will create a whitelist process for this drop. You will need to produce your own whitelist SPL token and provide the address below - users that mint this drop will need to hold a whitelist token to mint during the whitelist presale period">
              <span className="candy-icon-question" />
            </Tooltip>
          </span>
        }
      />

      <div className="candy-edition-form-item" hidden={Boolean(!form[CheckEnum.release])}>
        <label htmlFor="whitelistAddress">
          Whitelist Token Mint Address
          <Tooltip inner="Public key of the whitelist token mint">
            <span className="candy-icon-question" />
          </Tooltip>
        </label>
        <input
          id="whitelistAddress"
          name="whitelistAddress"
          placeholder="Enter Token Mint Address"
          value={form['whitelistAddress']}
          onChange={onChangeInput}
          required={Boolean(form[CheckEnum.release])}
        />
      </div>
      <div className="candy-edition-form-item" hidden={Boolean(!form[CheckEnum.release])}>
        <label htmlFor="whitelistDate">
          Whitelist Launch Date
          <Tooltip inner="Date when whitelisted users can begin mint">
            <span className="candy-icon-question" />
          </Tooltip>
        </label>
        <input
          id="whitelistDate"
          name="whitelistDate"
          type="date"
          onChange={onChangeInput}
          value={form['whitelistDate']}
          min={dayjs.utc().format('YYYY-MM-DD')}
        />
      </div>

      <label htmlFor="whitelistHour" className="candy-edition-time-label" hidden={Boolean(!form[CheckEnum.release])}>
        Whitelist Launch Time
        <Tooltip inner="Time when the whitelisted users can begin mint">
          <span className="candy-icon-question" />
        </Tooltip>
      </label>
      <div className="candy-edition-form-time" hidden={Boolean(!form[CheckEnum.release])}>
        <input
          id="whitelistHour"
          name="whitelistHour"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'1'}
          min={1}
          max={12}
          value={form['whitelistHour']}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
        />
        <span>:</span>
        <input
          id="whitelistMinute"
          name="whitelistMinute"
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'00'}
          min={0}
          max={59}
          value={form['whitelistMinute']}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
          onBlur={() => {
            const num = Number(form['whitelistMinute']);
            setForm((form) => ({ ...form, ['whitelistMinute']: num >= 10 ? `${num}` : `0${num}` }));
          }}
        />
        <div className="candy-edition-time-checkbox">
          <button
            className={getFormatTimeButtonClassName(form[CheckEnum.whitelistTimeFormat] === 'AM')}
            onClick={onCheck(CheckEnum.whitelistTimeFormat, 'AM')}
          >
            AM
          </button>
          <button
            className={getFormatTimeButtonClassName(form[CheckEnum.whitelistTimeFormat] === 'PM')}
            onClick={onCheck(CheckEnum.whitelistTimeFormat, 'PM')}
          >
            PM
          </button>
          <input
            hidden
            value={form[CheckEnum.whitelistTimeFormat]}
            id="-edition"
            name="whitelistTimeFormat"
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('This field is required.')}
            onChange={EMPTY_FUNCTION}
            required
          />
        </div>
      </div>

      <div className="candy-edition-buttons">
        <button className="candy-button candy-button-default" onClick={onBack}>
          Back
        </button>
        <input className="candy-button" id="edition-form-btn-submit" type="submit" value="Continue" />
      </div>
    </form>
  );
};
