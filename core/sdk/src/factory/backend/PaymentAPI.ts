import { AxiosInstance } from 'axios';
import {
  SingleBase,
  PaymentInfo,
  PaymentAvailabilityParams,
  ConfirmStripePaymentParams,
  ConfirmWertPaymentParams,
  CreateStripePaymentParams
} from '@liqnft/candy-shop-types';
import { CreateWertPaymentParams } from '../../shop';

/**
 * @note This backend Payment API should not be exposed in sdk entry.
 */

const PaymentRouter = '/payment';

export async function checkPaymentAvailability(
  axiosInstance: AxiosInstance,
  params: PaymentAvailabilityParams
): Promise<SingleBase<string>> {
  const { shopId, tokenMint } = params;
  const url = `${PaymentRouter}/available/shop/${shopId}/token/${tokenMint}`;
  return axiosInstance.get(url).then((res) => res.data);
}

export async function createPaymentIntents(
  axiosInstance: AxiosInstance,
  requestBody: CreateStripePaymentParams | CreateWertPaymentParams
): Promise<SingleBase<PaymentInfo>> {
  const url = `${PaymentRouter}/create`;
  return axiosInstance.post(url, requestBody).then((res) => res.data);
}

export function confirmPaymentIntents(
  axiosInstance: AxiosInstance,
  requestBody: ConfirmStripePaymentParams | ConfirmWertPaymentParams
): Promise<SingleBase<PaymentInfo>> {
  const url = `${PaymentRouter}/confirm`;
  return axiosInstance.post(url, requestBody).then((res) => res.data);
}
