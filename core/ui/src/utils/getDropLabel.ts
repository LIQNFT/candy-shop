import { Drop, DropStatus } from '@liqnft/candy-shop-types';

enum DropLabel {
  COMING_SOON = 'COMING SOON',
  LIVE = 'LIVE TOKEN SALE',
  WHITELIST_SALE = 'PRIVATE SALE',
  SOLD_OUT = 'SOLD OUT',
  ENDED = 'ENDED'
}
export const getDropLabel = (drop: Drop): DropLabel => {
  if (drop.currentSupply === drop.maxSupply) return DropLabel.SOLD_OUT;
  if (drop.status === DropStatus.CREATED) return DropLabel.COMING_SOON;
  if (drop.status === DropStatus.WHITELIST_STARTED) return DropLabel.WHITELIST_SALE;
  if (drop.status === DropStatus.SALE_STARTED) return DropLabel.LIVE;
  return DropLabel.ENDED;
};
