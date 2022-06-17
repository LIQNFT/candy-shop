import { OrderSortBy } from '@liqnft/candy-shop-sdk';

export const ORDER_FETCH_LIMIT = 12;
export const BACKGROUND_UPDATE_LIMIT = ORDER_FETCH_LIMIT * 2;
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

export const FILTER_ATTRIBUTES_MOCK = [
  {
    name: 'Material',
    options: [
      { label: '18k Silver', value: 1 },
      { label: '18k Gold 18k Silver 18k Silver', value: 0 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Background',
    options: [
      { label: '18k Gold 18k Silver', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Skin',
    options: [
      { label: '18k Gold', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Accessories',
    options: [
      { label: '18k Gold', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  }
];
