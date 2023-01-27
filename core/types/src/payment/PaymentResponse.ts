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
  stripeConfirmInfo?: StripeConfirmInfo;
  wertConfirmInfo?: WertConfirmInfo;
}

interface StripeConfirmInfo {
  requiresAuth: boolean;
  paymentIntentClientSecret?: string;
  stripeSdkObj?: any;
}

export interface WertConfirmInfo {
  partnerId: string;
  commodity: string;
  signedData: object;
}
