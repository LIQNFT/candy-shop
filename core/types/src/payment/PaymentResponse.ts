export enum PaymentErrorName {
  InvalidBuyerWallet = 'InvalidWallet',
  NotAllowedShop = 'NotAllowedShop',
  NotAllowedNft = 'NotAllowedNft',
  InvalidToken = 'InvalidToken',
  UnavailableToken = 'UnavailableToken',
  InsufficientPurchaseBalance = 'InsufficientPurchaseBalance',
  // TODO: define error to more granular level
  PurchaseNftError = 'PurchaseNftError',
  TransferNftError = 'TransferNftError',
  UnknownNftTransactionError = 'UnknownNftTransactionError',
  DataServiceError = 'DataServiceError',
  ExchangeRateError = 'ExchangeRateError',
  OutdatedPrice = 'OutdatedPrice',
  UnsupportedCurrency = 'UnsupportedCurrency',
  BelowMinPurchasePrice = 'BelowMinPurchasePrice'
}

export interface PaymentInfo {
  paymentEntityId: string;
}
