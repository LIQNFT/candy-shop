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
  paymentEntityId: string;
  paymentMethodId: string;
}
