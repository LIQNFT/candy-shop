export interface PaymentAvailabilityParams {
  shopId: string;
  tokenAccount: string;
}

export enum PaymentCurrencyType {
  USD = 'usd'
}

export enum PaymentMethodType {
  CARD = 'card'
}

export interface CreatePaymentParams {
  shopProgramId: string;
  shopId: string;
  shopCreatorAddress: string;
  buyerWalletAddress: string;
  tokenAccount: string;
  methodType: PaymentMethodType;
  currency: PaymentCurrencyType;
  currencyAmount: number;
}

export interface ConfirmStripePaymentParams {
  shopId: string;
  tokenAccount: string;
  paymentId: string;
  paymentMethodId: string;
}
export interface PaymentIntentInfo {
  paymentId: string;
}

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
