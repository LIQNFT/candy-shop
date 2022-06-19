/**
 * @note These payment APIs for candyShop only allow the shopId & token in allowlist to call.
 */

import {
  ConfirmStripePaymentParams,
  CreatePaymentParams,
  PaymentAvailabilityParams,
  PaymentIntentInfo,
  SingleBase
} from '@liqnft/candy-shop-types';
import { checkPaymentAvailability, confirmPaymentIntents, createPaymentIntents } from './factory/backend/PaymentAPI';
import axiosInstance from './vendor/config';

export abstract class CandyShopPay {
  static checkPaymentAvailability(params: PaymentAvailabilityParams): Promise<SingleBase<string>> {
    return checkPaymentAvailability(axiosInstance, params);
  }

  static createPayment(params: CreatePaymentParams): Promise<SingleBase<PaymentIntentInfo>> {
    return createPaymentIntents(axiosInstance, params);
  }

  static confirmPayment(params: ConfirmStripePaymentParams): Promise<SingleBase<PaymentIntentInfo>> {
    return confirmPaymentIntents(axiosInstance, params);
  }
}
