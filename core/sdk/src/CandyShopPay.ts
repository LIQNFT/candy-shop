/**
 * @note These payment APIs for candyShop only allow the shopId & token in allowlist to call.
 */

import {
  ConfirmStripePaymentParams,
  ConfirmWertPaymentParams,
  CreateStripePaymentParams,
  PaymentAvailabilityParams,
  PaymentInfo,
  SingleBase
} from '@liqnft/candy-shop-types';
import { checkPaymentAvailability, confirmPaymentIntents, createPaymentIntents } from './factory/backend/PaymentAPI';
import { CreateWertPaymentParams } from './shop';
import axiosInstance from './vendor/config';

export abstract class CandyShopPay {
  static checkPaymentAvailability(params: PaymentAvailabilityParams): Promise<SingleBase<string>> {
    return checkPaymentAvailability(axiosInstance, params);
  }

  static createPayment(params: CreateStripePaymentParams | CreateWertPaymentParams): Promise<SingleBase<PaymentInfo>> {
    return createPaymentIntents(axiosInstance, params);
  }

  static confirmPayment(
    params: ConfirmStripePaymentParams | ConfirmWertPaymentParams
  ): Promise<SingleBase<PaymentInfo>> {
    return confirmPaymentIntents(axiosInstance, params);
  }
}
