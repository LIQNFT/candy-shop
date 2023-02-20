import { DropUserInputSchema, DROP_USER_INPUT_SCHEMA } from 'constant/drop';
import dayjs from 'dayjs';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(IsSameOrBefore);
dayjs.extend(IsSameOrAfter);

export const enum FormKey {
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

export const enum TimeRowType {
  saleStart = 'saleStart',
  saleEnd = 'saleEnd',
  whitelist = 'whitelist'
}

export const TimeFormItems: Record<
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
  [FormKey.whitelistTimeFormat]: 'AM' | 'PM';
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
  [FormKey.saleStartTimeFormat]: 'AM' | 'PM';
  [FormKey.saleEndDate]: string;
  [FormKey.saleEndHour]: string;
  [FormKey.saleEndMinute]: string;
  [FormKey.saleEndTimeFormat]: 'AM' | 'PM';
  [FormKey.description]: string;
  [FormKey.hasRedemption]: boolean;
  [FormKey.redemptionName]: string;
  [FormKey.redemptionEmail]: string;
  [FormKey.inputSchema]: DropUserInputSchema[];
};

export const formDefaultValue: FormType = {
  name: '',
  whitelistAddress: '',
  whitelistTimeFormat: dayjs().hour() >= 12 ? 'PM' : 'AM',
  whitelistHour: '12',
  whitelistMinute: dayjs().minute().toString(),
  whitelistDate: dayjs().format('YYYY-MM-DD'),
  whitelistRelease: false,
  totalSupply: 0,
  mintPrice: '',
  salesPeriodZero: false,
  saleStartDate: dayjs().add(1, 'd').format('YYYY-MM-DD'),
  saleStartHour: '12',
  saleStartMinute: '00',
  saleStartTimeFormat: 'AM',
  saleEndDate: dayjs().add(2, 'd').format('YYYY-MM-DD'),
  saleEndHour: '12',
  saleEndMinute: '00',
  saleEndTimeFormat: 'AM',
  description: '',
  hasRedemption: false,
  redemptionName: '',
  redemptionEmail: '',
  inputSchema: DROP_USER_INPUT_SCHEMA.filter((item) => item.required)
};
