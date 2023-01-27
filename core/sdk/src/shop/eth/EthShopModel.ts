import { CreatePaymentParams } from '@liqnft/candy-shop-types';
import { OrderPayloadResponse } from '../../factory/conveyor/eth';
import { ShopSettings } from '../base/BaseShopModel';

export interface EthShopSettings extends ShopSettings {}

export interface CreateWertPaymentParams extends CreatePaymentParams {
  orderPayload: OrderPayloadResponse;
}
