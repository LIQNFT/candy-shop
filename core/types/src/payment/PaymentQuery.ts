import { PaymentCurrencyType } from './PaymentModel';

export interface GetQuotePriceQuery {
  quoteCurrencyType?: PaymentCurrencyType;
}
