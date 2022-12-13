import React, { useState, useEffect, ReactElement } from 'react';

import { Checkbox } from 'components/Checkbox';
import { Tooltip } from 'components/Tooltip';
import { Switch } from 'components/Switch';
import { InputText } from 'components/Form/Input';
import { MasterEditionNft } from '@liqnft/candy-shop-sdk';
import { convertTime12to24 } from 'utils/timer';
import { DropUserInputSchema, DROP_USER_INPUT_SCHEMA } from 'constant/drop';

import { EMPTY_FUNCTION } from 'utils/helperFunc';
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

const enum FormKey {
  name = 'name',
  whitelistAddress = 'whitelistAddress',
  whitelistTimeFormat = 'whitelistTimeFormat',
  whitelistHour = 'whitelistHour',
  whitelistMinute = 'whitelistMinute',
  whitelistDate = 'whitelistDate',
  totalSupply = 'totalSupply',
  mintPrice = 'mintPrice',
  whitelistRelease = 'whitelistRelease',
  salesPeriodZero = 'salesPeriodZero',
  saleStartDate = 'saleStartDate',
  saleStartHour = 'saleStartHour',
  saleStartMinute = 'saleStartMinute',
  saleStartTimeFormat = 'saleStartTimeFormat',
  saleEndDate = 'saleEndDate',
  saleEndHour = 'saleEndHour',
  saleEndMinute = 'saleEndMinute',
  saleEndTimeFormat = 'saleEndTimeFormat',
  description = 'description',
  hasRedemption = 'hasRedemption',
  redemptionName = 'redemptionName',
  redemptionEmail = 'redemptionEmail',
  inputSchema = 'inputSchema'
}

const enum TimeRowType {
  saleStart = 'saleStart',
  saleEnd = 'saleEnd',
  whitelist = 'whitelist'
}

const enum TimeFormat {
  AM = 'AM',
  PM = 'PM'
}

const TimeFormItems: Record<
  TimeRowType,
  {
    dateKey: FormKey;
    dateLabel: string;
    dateLabelTip: string;
    hourLabel: string;
    hourKey: FormKey;
    minuteKey: FormKey;
    timeFormatKey: FormKey;
  }
> = {
  [TimeRowType.saleStart]: {
    dateKey: FormKey.saleStartDate,
    dateLabel: 'Sale Start Date',
    dateLabelTip: 'Date when buyers can publicly mint from this drop',
    hourLabel: 'Sale Start Time',
    hourKey: FormKey.saleStartHour,
    minuteKey: FormKey.saleStartMinute,
    timeFormatKey: FormKey.saleStartTimeFormat
  },
  [TimeRowType.saleEnd]: {
    dateKey: FormKey.saleEndDate,
    dateLabel: 'Sale End Date',
    dateLabelTip: 'Date when buyers can no longer mint from this drop',
    hourLabel: 'Sale End Time',
    hourKey: FormKey.saleEndHour,
    minuteKey: FormKey.saleEndMinute,
    timeFormatKey: FormKey.saleEndTimeFormat
  },
  [TimeRowType.whitelist]: {
    dateKey: FormKey.whitelistDate,
    dateLabel: 'Whitelist Launch Date',
    dateLabelTip: 'Date when whitelisted users can begin mint',
    hourLabel: 'Whitelist Launch Time',
    hourKey: FormKey.whitelistHour,
    minuteKey: FormKey.whitelistMinute,
    timeFormatKey: FormKey.whitelistTimeFormat
  }
};

export type FormType = {
  [FormKey.name]: string;
  [FormKey.whitelistAddress]: string;
  [FormKey.whitelistTimeFormat]: TimeFormat;
  [FormKey.whitelistHour]: string;
  [FormKey.whitelistMinute]: string;
  [FormKey.whitelistDate]: string;
  [FormKey.totalSupply]: number;
  [FormKey.mintPrice]: string;
  [FormKey.whitelistRelease]: boolean;
  // salesPeriod: string; = end - start
  [FormKey.salesPeriodZero]: boolean;
  [FormKey.saleStartDate]: string;
  [FormKey.saleStartHour]: string;
  [FormKey.saleStartMinute]: string;
  [FormKey.saleStartTimeFormat]: TimeFormat;
  [FormKey.saleEndDate]: string;
  [FormKey.saleEndHour]: string;
  [FormKey.saleEndMinute]: string;
  [FormKey.saleEndTimeFormat]: TimeFormat;
  [FormKey.description]: string;
  [FormKey.hasRedemption]: boolean;
  [FormKey.redemptionName]: string;
  [FormKey.redemptionEmail]: string;
  [FormKey.inputSchema]: DropUserInputSchema[];
};

const validateInput = (nodeId: FormKey, message: string) => {
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
  const [form, setForm] = useState<FormType>((): Record<FormKey, any> => {
    const getHour = () => {
      const hour = dayjs().hour();
      if (hour === 0) return '12';
      if (hour > 12) return (hour - 12).toString();
      return hour.toString();
    };

    return {
      name: nft.name,
      whitelistAddress: '',
      whitelistTimeFormat: dayjs().hour() >= 12 ? TimeFormat.PM : TimeFormat.AM,
      whitelistHour: getHour(),
      whitelistMinute: dayjs().minute().toString(),
      whitelistDate: dayjs().format('YYYY-MM-DD'),
      totalSupply: nft.maxSupply,
      mintPrice: '',
      whitelistRelease: false,
      salesPeriodZero: false,
      saleStartDate: dayjs().add(1, 'd').format('YYYY-MM-DD'),
      saleStartHour: '12',
      saleStartMinute: '00',
      saleStartTimeFormat: TimeFormat.AM,
      saleEndDate: dayjs().add(2, 'd').format('YYYY-MM-DD'),
      saleEndHour: '12',
      saleEndMinute: '00',
      saleEndTimeFormat: TimeFormat.AM,
      description: '',
      hasRedemption: false,
      redemptionName: '',
      redemptionEmail: '',
      inputSchema: DROP_USER_INPUT_SCHEMA.filter((item) => item.required)
    };
  });

  const onResetValidation = () => {
    validateInput(FormKey.saleStartDate, '');
    validateInput(FormKey.saleEndDate, '');
    validateInput(FormKey.whitelistDate, '');
  };

  const onCheckTimeFormat = (key: FormKey, value?: any) => (e: any) => {
    e.preventDefault();
    onResetValidation();
    setForm((prev: FormType) => ({ ...prev, [key]: value }));
  };

  const onCheckbox = (key: FormKey) => () => {
    onResetValidation();

    setForm((prev: FormType) => ({ ...prev, [key]: !prev[key] }));
  };

  const onCheckInputSchema = (schema: DropUserInputSchema) => () => {
    const prevInputSchema = form.inputSchema;
    const inputSchema = prevInputSchema.includes(schema)
      ? prevInputSchema.filter((n) => n !== schema)
      : prevInputSchema.concat(schema);

    setForm((form: FormType) => ({ ...form, inputSchema }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target as { value: any; name: FormKey };
    onResetValidation();
    setForm((prev: FormType) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();

    const NOW = dayjs();

    const startTime = dayjs(
      `${form.saleStartDate} ${convertTime12to24(form.saleStartHour, form.saleStartMinute, form.saleStartTimeFormat)}`
    );

    const endTime = dayjs(
      `${form.saleEndDate} ${convertTime12to24(form.saleEndHour, form.saleEndMinute, form.saleEndTimeFormat)}`
    );

    if (form.whitelistRelease) {
      const whitelistDate = dayjs(
        `${form.whitelistDate} ${convertTime12to24(form.whitelistHour, form.whitelistMinute, form.whitelistTimeFormat)}`
      );

      if (whitelistDate.isSameOrBefore(NOW)) {
        validateInput(FormKey.whitelistDate, 'Whitelist time must be > current time.');
        return reportValidity();
      }

      if (whitelistDate.isSameOrAfter(startTime)) {
        validateInput(FormKey.whitelistDate, 'Whitelist time must be < Sale start time.');
        return reportValidity();
      }
    }

    if (startTime.isSameOrBefore(NOW)) {
      validateInput(FormKey.saleStartDate, 'Sale start time must be > current time.');
      return reportValidity();
    }

    if (!form.salesPeriodZero && startTime.isSameOrAfter(endTime)) {
      validateInput(FormKey.saleStartDate, 'Sale start time must be < Sale end time.');
      return reportValidity();
    }

    onSubmit(form);
  };

  useEffect(() => {
    if (formData) setForm(formData);
  }, [formData]);

  return (
    <form id="edition-form" className="candy-edition-form" onSubmit={onSubmitForm}>
      <p className="candy-subTitle">Enter details on your new edition drop</p>

      <InputText
        name={FormKey.name}
        placeholder="Enter Drop Name"
        label="Drop Name"
        labelTip="Display name for this NFT drop"
        disabled
        onChangeInput={onChangeInput}
        value={form[FormKey.name]}
      />

      <SaleTimeRow
        type={TimeRowType.saleStart}
        form={form}
        setForm={setForm}
        onCheck={onCheckTimeFormat}
        onChangeInput={onChangeInput}
      />
      <SaleTimeRow
        type={TimeRowType.saleEnd}
        form={form}
        setForm={setForm}
        onCheck={onCheckTimeFormat}
        onChangeInput={onChangeInput}
        disabled={Boolean(form.salesPeriodZero)}
      />

      <Switch
        name={FormKey.salesPeriodZero}
        onChange={onCheckbox(FormKey.salesPeriodZero)}
        checked={Boolean(form.salesPeriodZero)}
      >
        Sale ends when all NFTs have been sold out
      </Switch>

      <div className="candy-edition-form-price">
        <InputNumber
          name={FormKey.totalSupply}
          label="Total Supply"
          labelTip="Maximum number of editions to be created - based on Metaplex max supply attribute"
          onChangeInput={onChangeInput}
          value={form[FormKey.totalSupply]?.toString()}
        />
        <InputNumber
          name={FormKey.mintPrice}
          label="Mint Price"
          labelTip="Price of each edition drop"
          onChangeInput={onChangeInput}
          prefix={<span className="candy-edition-form-sol">{currencySymbol}</span>}
          required
          value={form[FormKey.mintPrice]}
        />
      </div>

      <InputText
        name={FormKey.description}
        placeholder="Enter Drop Description"
        label="Drop Description"
        labelTip="Display description for this NFT drop"
        maxLength={200}
        onChangeInput={onChangeInput}
        value={form[FormKey.description]}
        showMaxLength
      />

      {/** Redemption view */}
      <Checkbox
        onClick={onCheckbox(FormKey.hasRedemption)}
        checked={Boolean(form[FormKey.hasRedemption])}
        id={FormKey.hasRedemption}
        label={
          <label className="candy-edition-checkbox-label">
            Item Redemption
            <Tooltip inner="By checking this box, you will create edition redemption for this NFT">
              <span className="candy-icon-question" />
            </Tooltip>
          </label>
        }
      />

      <div className="candy-edition-redemption" hidden={!form[FormKey.hasRedemption]}>
        <div>
          {DROP_USER_INPUT_SCHEMA.map((schema) => {
            const checked = Boolean(form[FormKey.inputSchema].includes(schema));
            return (
              <Checkbox
                key={schema.name}
                disabled={schema.required}
                onClick={onCheckInputSchema(schema)}
                checked={checked}
                id={'item-redemption-' + schema.name}
                label={schema.label}
              />
            );
          })}
        </div>
        <div className="candy-edition-redemption-preview">
          <b>Preview</b>
          {form.inputSchema.map((schema) => {
            return (
              <InputText
                key={schema.name}
                name={schema.name}
                label={schema.label}
                onChangeInput={onChangeInput}
                disabled
                value={form[FormKey.redemptionName]}
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

      {/** Whitelist view */}
      <Checkbox
        onClick={onCheckbox(FormKey.whitelistRelease)}
        checked={Boolean(form[FormKey.whitelistRelease])}
        id={FormKey.whitelistRelease}
        label={
          <label className="candy-edition-checkbox-label">
            Whitelist Release
            <Tooltip inner="By checking this box, you will create a whitelist process for this drop. You will need to produce your own whitelist SPL token and provide the address below - users that mint this drop will need to hold a whitelist token to mint during the whitelist presale period">
              <span className="candy-icon-question" />
            </Tooltip>
          </label>
        }
      />

      <div className="candy-edition-form-item" hidden={Boolean(!form[FormKey.whitelistRelease])}>
        <label htmlFor={FormKey.whitelistAddress}>
          Whitelist Token Mint Address
          <Tooltip inner="Public key of the whitelist token mint">
            <span className="candy-icon-question" />
          </Tooltip>
        </label>
        <input
          id={FormKey.whitelistAddress}
          name={FormKey.whitelistAddress}
          placeholder="Enter Token Mint Address"
          value={form[FormKey.whitelistAddress]}
          onChange={onChangeInput}
          required={Boolean(form[FormKey.whitelistRelease])}
        />
      </div>
      <SaleTimeRow
        type={TimeRowType.whitelist}
        hidden={Boolean(!form[FormKey.whitelistRelease])}
        form={form}
        setForm={setForm}
        onCheck={onCheckTimeFormat}
        onChangeInput={onChangeInput}
      />

      <div className="candy-edition-buttons">
        <button className="candy-button candy-button-default" onClick={onBack}>
          Back
        </button>
        <input className="candy-button" id="edition-form-btn-submit" type="submit" value="Continue" />
      </div>
    </form>
  );
};

interface SaleTImeRowProps {
  type: TimeRowType;
  hidden?: boolean;
  onChangeInput: React.ChangeEventHandler<HTMLInputElement>;
  form: FormType;
  setForm: React.Dispatch<React.SetStateAction<FormType>>;
  onCheck: (form: FormKey, value?: any) => (e: any) => void;
  disabled?: boolean;
}

const SaleTimeRow: React.FC<SaleTImeRowProps> = ({ type, hidden, onChangeInput, form, setForm, onCheck, disabled }) => {
  const rowInfo = TimeFormItems[type];

  const preventUpdateNumberOnWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const getFormatTimeButtonClassName = (isActive: boolean) =>
    `candy-edition-radio ${isActive ? '' : 'candy-edition-radio-disable'}`;

  return (
    <div className={`candy-edition-sale-time${disabled ? ' candy-edition-sale-time-disabled' : ''}`} hidden={hidden}>
      <div className="candy-edition-form-item">
        <label htmlFor={rowInfo.dateKey}>
          {rowInfo.dateLabel}
          <Tooltip inner={rowInfo.dateLabelTip}>
            <span className="candy-icon-question" />
          </Tooltip>
        </label>

        <input
          id={rowInfo.dateKey}
          name={rowInfo.dateKey}
          type="date"
          onChange={onChangeInput}
          value={form[rowInfo.dateKey] as string}
          min={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      <div className="candy-edition-form-item">
        <label htmlFor={rowInfo.hourKey}>{rowInfo.hourLabel}</label>
        <input
          id={rowInfo.hourKey}
          name={rowInfo.hourKey}
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'1'}
          min={1}
          max={12}
          required={!hidden}
          value={form[rowInfo.hourKey] as string}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
        />
      </div>

      <span className="candy-edition-sale-time-colon">:</span>
      <div className="candy-edition-form-item">
        <input
          id={rowInfo.minuteKey}
          name={rowInfo.minuteKey}
          type="number"
          onWheel={preventUpdateNumberOnWheel}
          placeholder={'00'}
          min={0}
          max={59}
          required={!hidden}
          value={form[rowInfo.minuteKey] as string}
          onChange={onChangeInput}
          maxLength={2}
          step="any"
          onBlur={() => {
            const num = Number(form[FormKey.saleStartMinute]);
            setForm((form: FormType) => ({ ...form, [FormKey.saleStartMinute]: num >= 10 ? `${num}` : `0${num}` }));
          }}
        />
      </div>
      <div className="candy-edition-form-item">
        <button
          className={getFormatTimeButtonClassName(form[rowInfo.timeFormatKey] === TimeFormat.AM)}
          onClick={onCheck(rowInfo.timeFormatKey, TimeFormat.AM)}
        >
          {TimeFormat.AM}
        </button>
      </div>
      <div className="candy-edition-form-item">
        <button
          className={getFormatTimeButtonClassName(form[rowInfo.timeFormatKey] === TimeFormat.PM)}
          onClick={onCheck(rowInfo.timeFormatKey, TimeFormat.PM)}
        >
          {TimeFormat.PM}
        </button>
        <input
          hidden
          value={form[rowInfo.timeFormatKey] as string}
          id={rowInfo.timeFormatKey}
          name={rowInfo.timeFormatKey}
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('This field is required.')}
          onChange={EMPTY_FUNCTION}
          required={!hidden}
        />
      </div>
    </div>
  );
};

const InputNumber = (props: {
  label: string;
  labelTip?: string;
  name: FormKey;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  value?: string;
  onChangeInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  prefix?: ReactElement;
}) => {
  return (
    <div className="candy-edition-form-item">
      <label htmlFor={props.name}>
        {props.label}
        {props.labelTip && (
          <Tooltip inner={props.labelTip}>
            <span className="candy-icon-question" />
          </Tooltip>
        )}
      </label>
      <input
        id={props.name}
        name={props.name}
        type="number"
        placeholder="0"
        required={props.required}
        min={0}
        value={props.value}
        onChange={props.onChangeInput}
        step="any"
        disabled={props.disabled}
        onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
          event.currentTarget.blur();
        }}
      />
      {props.prefix}
    </div>
  );
};
