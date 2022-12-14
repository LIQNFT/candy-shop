import { Drop, DropStatus } from '@liqnft/candy-shop-types';

enum DropLabel {
  COMING_SOON = 'COMING SOON',
  LIVE = 'LIVE',
  WHITELIST_SALE = 'WHITELIST SALE',
  SOLD_OUT = 'SOLD OUT',
  ENDED = 'ENDED'
}
enum DropLabelTag {
  COMING_SOON = 'candy-status-tag candy-status-tag-yellow',
  LIVE = 'candy-status-tag',
  WHITELIST_SALE = 'candy-status-tag',
  SOLD_OUT = 'candy-status-tag candy-status-tag-gray',
  ENDED = 'candy-status-tag candy-status-tag-gray'
}
export const getDropLabel = (drop: Drop): DropLabel => {
  if (drop.currentSupply === drop.maxSupply) return DropLabel.SOLD_OUT;
  if (drop.status === DropStatus.CREATED) return DropLabel.COMING_SOON;
  if (drop.status === DropStatus.WHITELIST_STARTED) return DropLabel.WHITELIST_SALE;
  if (drop.status === DropStatus.SALE_STARTED) return DropLabel.LIVE;
  return DropLabel.ENDED;
};
export const getDropLabelTag = (drop: Drop): DropLabelTag => {
  if (drop.currentSupply === drop.maxSupply) return DropLabelTag.SOLD_OUT;
  if (drop.status === DropStatus.CREATED) return DropLabelTag.COMING_SOON;
  if (drop.status === DropStatus.WHITELIST_STARTED) return DropLabelTag.WHITELIST_SALE;
  if (drop.status === DropStatus.SALE_STARTED) return DropLabelTag.LIVE;
  return DropLabelTag.ENDED;
};
