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

export interface DropUserInputSchema {
  name: string;
  type: string;
  label: string;
  required: boolean;
}

export const DROP_USER_INPUT_SCHEMA: DropUserInputSchema[] = [
  { name: 'userName', type: 'string', label: 'Name', required: true },
  { name: 'userEmail', type: 'email', label: 'Email', required: true }
  // { name: 'address', type: 'string', label: 'Address', required: false },
  // { name: 'tel', type: 'string', label: 'Telephone', required: false },
  // { name: 'twitter', type: 'string', label: 'Twitter', required: false },
  // { name: 'discord', type: 'string', label: 'Discord', required: false }
];
