/**
 * @note These payment APIs for candyShop only allow the shopId & token in allowlist to call.
 */

import {
  ConfirmStripePaymentParams,
  CreatePaymentParams,
  GetQuotePriceQuery,
  PaymentAvailabilityParams,
  PaymentInfo,
  SingleBase
} from '@liqnft/candy-shop-types';
import {
  checkPaymentAvailability,
  confirmPaymentIntents,
  createPaymentIntents,
  fetchTokenFiatMoneyPrice
} from './factory/backend/PaymentAPI';
import axiosInstance from './vendor/config';

export abstract class CandyShopPay {
  static checkPaymentAvailability(params: PaymentAvailabilityParams): Promise<SingleBase<string>> {
    return checkPaymentAvailability(axiosInstance, params);
  }

  static createPayment(params: CreatePaymentParams): Promise<SingleBase<PaymentInfo>> {
    return createPaymentIntents(axiosInstance, params);
  }

  static confirmPayment(params: ConfirmStripePaymentParams): Promise<SingleBase<PaymentInfo>> {
    return confirmPaymentIntents(axiosInstance, params);
  }

  static getTokenFiatMoneyPrice(
    params: PaymentAvailabilityParams,
    quotePriceQuery: GetQuotePriceQuery | undefined
  ): Promise<SingleBase<string>> {
    return fetchTokenFiatMoneyPrice(axiosInstance, params, quotePriceQuery);
  }
}
