export interface PaymentAvailabilityParams {
  shopId: string;
  tokenMint: string;
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
  tokenMint: string;
}

export interface CreateStripePaymentParams extends CreatePaymentParams {
  methodType: PaymentMethodType;
  currency: PaymentCurrencyType;
  currencyAmount: number;
}

interface ConfirmPaymentParams {
  shopId: string;
  paymentEntityId: string;
}

export interface ConfirmStripePaymentParams extends ConfirmPaymentParams {
  paymentMethodId: string;
}

export interface ConfirmWertPaymentParams extends ConfirmPaymentParams {
  paymentStatus: object;
}
