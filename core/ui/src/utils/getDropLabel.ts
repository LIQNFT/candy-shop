import { Drop, DropStatus } from '@liqnft/candy-shop-types';

enum DropLabel {
  STARTING_SOON = 'STARTING SOON',
  LIVE = 'LIVE TOKEN SAVE',
  WHITELIST_SALE = 'PRIVATE SALE',
  SOLD_OUT = 'SOLD OUT',
  ENDED = 'ENDED'
}
export const getDropLabel = (drop: Drop): DropLabel => {
  if (drop.status === DropStatus.CREATED) return DropLabel.STARTING_SOON;
  if (drop.status === DropStatus.WHITELIST_STARTED) return DropLabel.WHITELIST_SALE;
  if (drop.status === DropStatus.SALE_STARTED) return DropLabel.LIVE;
  return DropLabel.ENDED;
};
