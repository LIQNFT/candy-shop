import { AxiosInstance } from 'axios';
import {
  SingleBase,
  PaymentIntentInfo,
  PaymentAvailabilityParams,
  CreatePaymentParams,
  ConfirmStripePaymentParams,
  GetQuotePriceQuery
} from '@liqnft/candy-shop-types';

/**
 * @note This backend Payment API should not be exposed in sdk entry.
 */

const PaymentRouter = '/payment';

export async function checkPaymentAvailability(
  axiosInstance: AxiosInstance,
  params: PaymentAvailabilityParams
): Promise<SingleBase<string>> {
  const { shopId, tokenAccount } = params;
  const url = `${PaymentRouter}/available/shop/${shopId}/token/${tokenAccount}`;
  return axiosInstance.get(url).then((res) => res.data);
}

export async function createPaymentIntents(
  axiosInstance: AxiosInstance,
  requestBody: CreatePaymentParams
): Promise<SingleBase<PaymentIntentInfo>> {
  const url = `${PaymentRouter}/create`;
  return axiosInstance.post(url, requestBody).then((res) => res.data);
}

export function confirmPaymentIntents(
  axiosInstance: AxiosInstance,
  requestBody: ConfirmStripePaymentParams
): Promise<SingleBase<PaymentIntentInfo>> {
  const url = `${PaymentRouter}/confirm`;
  return axiosInstance.post(url, requestBody).then((res) => res.data);
}

export async function fetchTokenFiatMoneyPrice(
  axiosInstance: AxiosInstance,
  params: PaymentAvailabilityParams,
  quotePriceQuery?: GetQuotePriceQuery
): Promise<SingleBase<string>> {
  const { shopId, tokenAccount } = params;
  const { quoteCurrencyType } = quotePriceQuery || {};

  const url = `${PaymentRouter}/price/shop/${shopId}/token/${tokenAccount}${
    quoteCurrencyType ? `?quoteCurrencyType=${quoteCurrencyType}` : ''
  }`;
  return axiosInstance.get(url).then((res) => res.data);
}
