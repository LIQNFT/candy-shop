import { Seaport } from '@opensea/seaport-js';
import { ConsiderationInputItem, OrderComponents } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';
import axiosInstance from '../../../vendor/config';
import {
  AssetType,
  AssetInstance,
  OrderResponse,
  SeaportOrderData,
  ShopResponse,
  SplitReceiver,
  ExecuteOrderParams,
  OrderPayloadResponse
} from './types';

interface CreateOrderParams {
  shopUuid: string;
  orderData: SeaportOrderData;
  signature: string;
}

const Logger = 'CandyShopSDK/EthereumPort';
/**
 * Handling the Ethereum transactions by Seaport
 */
export class EthereumPort {
  private percentageBase = 100;
  private readonly apiPath = 'eth';
  private logger = 'EthereumPort';

  /**
   * Seller uses this function to cancel a listing.
   * @param signer
   * @param uuid orderUuid
   * @returns
   */
  async cancelOrder(signer: ethers.providers.JsonRpcSigner, uuid: string): Promise<string> {
    const seaport = new Seaport(signer);
    const accountAddress = await signer.getAddress();

    const order = await this.getOrderByUuid(uuid);
    const orders = [JSON.parse(order.rawOrderParams)];
    const tx = await seaport.cancelOrders(orders, accountAddress).transact();
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  /**
   * Buyer uses this to fulfill an order.
   * @param signer
   * @param uuid
   * @returns
   */
  async fulfillOrder(signer: ethers.providers.JsonRpcSigner, uuid: string): Promise<string> {
    const seaport = new Seaport(signer);
    const order = await this.getOrderByUuid(uuid);
    const accountAddress = await signer.getAddress();
    const orderComponents: OrderComponents = JSON.parse(order.rawOrderParams);
    const { executeAllActions } = await seaport.fulfillOrder({
      order: { parameters: orderComponents, signature: order.signature },
      accountAddress
    });
    const execution = await executeAllActions();
    const receipt = await execution.wait();
    return receipt.transactionHash;
  }

  private calculatePaymentSplitAmount(value: string, percentage: string) {
    const totalAmount = ethers.BigNumber.from(value);
    const splitAmount = totalAmount.mul(parseFloat(percentage) * this.percentageBase).div(this.percentageBase);

    return splitAmount;
  }

  private getSplitReceiver(splitReceiver: SplitReceiver, offerer: string, shop: ShopResponse) {
    switch (splitReceiver) {
      case SplitReceiver.ShopOwner:
        return shop.ownerAddress;
      case SplitReceiver.Seller:
        return offerer;
      case SplitReceiver.Platform:
        return '0x358061bdbEfCb392105375D932Cc13c32f81A334';
      default:
        throw Error('invalid split receiver value');
    }
  }

  getConsiderationFromOrder(
    offerer: string,
    consideration: AssetInstance,
    shop: ShopResponse
  ): ConsiderationInputItem[] {
    const shopSplit = shop.paymentSplit;
    const considerations = [];
    for (const split of shopSplit) {
      const percentage = split.percentage;
      const splitReceiver = this.getSplitReceiver(split.receiver, offerer, shop);
      if (!consideration?.value) {
        console.log(`${Logger}: consideration.value is invalid of paymentSplit=`, split);
        continue;
      }
      const startAmount = this.calculatePaymentSplitAmount(consideration.value, percentage).toString();
      considerations.push({
        token: consideration.type === AssetType.ERC20 ? consideration.address : ethers.constants.AddressZero,
        amount: startAmount,
        recipient: splitReceiver
      });
    }
    return considerations;
  }

  convertToSeaportOrderData(orderComponents: OrderComponents): SeaportOrderData {
    return {
      counter: orderComponents.counter,
      offerer: orderComponents.offerer,
      zone: orderComponents.zone,
      orderType: orderComponents.orderType,
      startTime: orderComponents.startTime.toString(),
      endTime: orderComponents.endTime.toString(),
      zoneHash: orderComponents.zoneHash,
      salt: orderComponents.salt,
      offer: orderComponents.offer,
      consideration: orderComponents.consideration,
      totalOriginalConsiderationItems: Number(orderComponents.totalOriginalConsiderationItems.toString()),
      conduitKey: orderComponents.conduitKey
    };
  }

  async getShopByUuid(uuid: string): Promise<{ result: ShopResponse }> {
    return axiosInstance.get(`${this.apiPath}/shop/${uuid}`).then((res) => res.data);
  }

  async getOrderByUuid(uuid: string): Promise<OrderResponse> {
    return axiosInstance.get(`${this.apiPath}/order/${uuid}`).then((res) => res.data.result);
  }

  async getFulfillOrderPayloadByUuid(uuid: string, buyerAddress: string): Promise<OrderPayloadResponse> {
    return axiosInstance
      .get(`${this.apiPath}/order/payload/${uuid}/buyer/${buyerAddress}`)
      .then((res) => res.data.result);
  }

  /**
   * Execute orders by seaport and create orders in candy shop
   * @param params ExecuteOrderParams
   * @returns uuid of executed order
   */
  async executeOrder(params: ExecuteOrderParams): Promise<string> {
    const seaport = new Seaport(params.signer);
    const shopUuid = params.shopUuid;
    const createOrderInput = params.createOrderInput;
    const { executeAllActions } = await seaport
      .createOrder(createOrderInput, params.accountAddress)
      .catch((err: Error) => {
        console.log(`${this.logger}, failed to execute order, err=${err.message}`);
        throw err;
      });

    const orderRes = await executeAllActions().catch((err: Error) => {
      console.log(`${this.logger}, failed to executeAllActions, err=${err.message}`);
      throw err;
    });

    const { signature, parameters } = orderRes;
    const data = {
      signature,
      orderData: this.convertToSeaportOrderData(parameters),
      shopUuid
    };

    const orderResult = await this.createOrder(data);
    return orderResult.uuid;
  }

  private createOrder(createOrder: CreateOrderParams): Promise<OrderResponse> {
    return axiosInstance.post(`${this.apiPath}/order`, createOrder).then((res) => res.data);
  }
}
