import { DropStatus } from '@liqnft/candy-shop-types';

export enum DropFilterType {
  All,
  LiveDrops,
  ComingSoon,
  PreviousDrops
}

export interface DropFilter {
  label: string;
  value: DropStatus[] | undefined;
}

export const FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Live Drops', value: [DropStatus.SALE_STARTED, DropStatus.WHITELIST_STARTED] },
  { label: 'Coming Soon', value: [DropStatus.CREATED] },
  { label: 'Previous Drops', value: [DropStatus.SALE_COMPLETED] }
];
