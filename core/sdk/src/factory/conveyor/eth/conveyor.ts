import { Seaport } from '@opensea/seaport-js';
import { EIP_712_ORDER_TYPE } from '@opensea/seaport-js/lib/constants';
import { ConsiderationInputItem, OrderComponents, OrderParameters } from '@opensea/seaport-js/lib/types';
import { ethers, TypedDataDomain } from 'ethers';
import { ApiCaller, RequestMethod } from './api';
import { SeaportHelper } from './seaport';
import { AssetType } from './types/asset.type';
import { AssetInstanceInterface, CreateOrderInterface, OrderResponse, SeaportOrderData } from './types/order.type';
import { ShopResponse, SplitReceiver } from './types/shop.type';

const Logger = 'EthereumSDK';

export { AssetType };
export { ApiCaller };
export class EthereumSDK {
  private percentageBase = 100;
  constructor(private apiCaller: ApiCaller) {}

  /**
   * Seller uses this function to cancel a listing.
   * @param signer
   * @param uuid orderUuid
   * @returns
   */
  async cancelOrder(signer: ethers.providers.JsonRpcSigner, uuid: string): Promise<string> {
    const seaport = SeaportHelper.getSeaport(signer);
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
    const seaport = SeaportHelper.getSeaport(signer);
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
    consideration: AssetInstanceInterface,
    shop: ShopResponse
  ): ConsiderationInputItem[] {
    const shopSplit = shop.paymentSplit;
    let considerations = [];
    for (const split of shopSplit) {
      const percentage = split.percentage;
      const splitReceiver = this.getSplitReceiver(split.receiver, offerer, shop);
      const startAmount = this.calculatePaymentSplitAmount(consideration.value!, percentage).toString();
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

  async signOrder(order: OrderParameters, signer: ethers.providers.JsonRpcSigner): Promise<string> {
    const seaport = new Seaport(signer);
    const counter = await seaport.getCounter(order.offerer);
    const domain = (await (seaport as any)._getDomainData()) as TypedDataDomain;
    const types = EIP_712_ORDER_TYPE;
    const signature = await signer._signTypedData(domain, types, { counter, ...order });
    return signature;
  }

  async getShopByUuid(uuid: string): Promise<{ result: ShopResponse }> {
    return this.apiCaller.request(`/shop/${uuid}`, RequestMethod.Get, {});
  }

  async createOrder(createOrder: CreateOrderInterface): Promise<OrderResponse> {
    return this.apiCaller.request('/order', RequestMethod.Post, createOrder);
  }

  async getOrderByUuid(uuid: string): Promise<OrderResponse> {
    return this.apiCaller.request(`/order/${uuid}`, RequestMethod.Get, {}).then((res) => res.result);
  }
}
