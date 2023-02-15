import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import dayjs from 'dayjs';

export const BIDDING_WINDOWS = [
  { label: '3m', value: '180' },
  { label: '5m', value: '300' },
  { label: '10m', value: '600' },
  { label: '15m', value: '900' }
];

export interface AuctionFormProps {
  onSubmit: (...args: any) => void;
  currencySymbol?: string;
  fee?: number;
  nft: SingleTokenInfo;
  auctionForm?: FormType;
  onBack: () => void;
  showExtensionBidding: boolean;
}

export type FormType = {
  startingBid: string;
  buyNowPrice: string;
  biddingPeriod?: number;
  startClockFormat: 'PM' | 'AM';
  startHour: string;
  startMinute: string;
  endClockFormat: 'PM' | 'AM';
  endHour: string;
  endMinute: string;
  buyNow?: boolean;
  startNow?: boolean;
  startDate: string;
  endDate: string;
  tickSize: string;
  disableBiddingExtension: boolean;
  extensionPeriod: string;
};

export const formDefaultValues: FormType = {
  startingBid: '',
  tickSize: '',
  buyNowPrice: '',
  startHour: '12',
  startMinute: '00',
  startClockFormat: 'AM',
  endClockFormat: 'AM',
  endHour: '12',
  endMinute: '00',
  startNow: false,
  buyNow: false,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(1, 'd').format('YYYY-MM-DD'),
  disableBiddingExtension: false,
  extensionPeriod: ''
};
