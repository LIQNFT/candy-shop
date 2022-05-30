export interface ShopStatus {
  timestamp: number;
  type: ShopStatusType;
}

export enum ShopStatusType {
  Order = 'ORDER',
  Trade = 'TRADE',
  UserNft = 'USER_NFT'
}
