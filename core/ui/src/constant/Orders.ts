import { OrderSortBy } from '@liqnft/candy-shop-sdk';

export const ORDER_FETCH_LIMIT = 12;
export const LOADING_SKELETON_COUNT = 4;

export const SORT_OPTIONS: { value: OrderSortBy; label: string }[] = [
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'desc'
    },
    label: 'Newest'
  },
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'asc'
    },
    label: 'Oldest'
  },
  {
    value: {
      column: 'price',
      order: 'asc'
    },
    label: 'Price: Low → High'
  },
  {
    value: {
      column: 'price',
      order: 'desc'
    },
    label: 'Price: High → Low'
  }
];
