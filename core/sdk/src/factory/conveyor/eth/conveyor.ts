import { Seaport } from '@opensea/seaport-js';
import { EIP_712_ORDER_TYPE, ItemType, MAX_INT, NO_CONDUIT, OrderType } from '@opensea/seaport-js/lib/constants';
import { ConsiderationItem, OfferItem, OrderComponents, OrderParameters } from '@opensea/seaport-js/lib/types';
import { BigNumber, ethers, TypedDataDomain } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { ApiCaller, RequestMethod } from './api';
import BlockchainService, { DEFAULT_GAS_LIMIT } from './blockchain';
import { AssetType } from './types/asset.type';
import { AssetInstanceInterface, CreateOrderInterface, OrderResponse } from './types/order.type';
import { ShopResponse, SplitReceiver } from './types/shop.type';
import { SeaportHelper } from './seaport';

const Logger = 'EthereumSDK';

export { AssetType };
export class EthereumSDK {
  private percentageBase = 100;
  constructor(private apiCaller: ApiCaller) {}

  /**
   * Buyer uses this function to grant seaport contract right to move tokens as payment in exchange for some
   * NFTs if sell condition matches.
   * @param signer
   * @param asset
   * @returns
   */
  async makeConsiderationAllowance(
    signer: ethers.providers.JsonRpcSigner,
    asset: AssetInstanceInterface
  ): Promise<string> {
    const seaport = SeaportHelper.getSeaport(signer);
    const contract = BlockchainService.getPaymentContract(asset, signer);
    const price = BigNumber.from(asset.value!).toHexString();
    const gasLimit = await contract.estimateGas.approve(seaport.contract.address, price);
    const txData = BlockchainService.getConsiderationAllowanceTxData(asset.address, seaport.contract.address, price);
    const { transactionHash } = await BlockchainService.executeTransaction(contract, txData, gasLimit);
    return transactionHash;
  }

  /**
   * Seller uses this function to grant seaport contract right to move their NFT if sell
   * condition matches.
   * @param signer
   * @param asset
   * @returns
   */
  async makeOfferAllowance(signer: ethers.providers.JsonRpcSigner, asset: AssetInstanceInterface): Promise<string> {
    const seaport = SeaportHelper.getSeaport(signer);
    const contract = BlockchainService.getNftContract(asset, signer);
    const approved = true;
    const txData = BlockchainService.getOfferAllowanceTxData(asset.address, seaport.contract.address, approved);
    const gasLimit = await contract.estimateGas.setApprovalForAll(seaport.contract.address, approved);
    const { transactionHash } = await BlockchainService.executeTransaction(contract, txData, gasLimit);
    return transactionHash;
  }

  /**
   * Seller uses this function to cancel a listing.
   * @param signer
   * @param uuid orderUuid
   * @returns
   */
  async cancelOrder(signer: ethers.providers.JsonRpcSigner, uuid: string): Promise<string> {
    const seaport = SeaportHelper.getSeaport(signer);
    const order = await this.getOrderByUuid(uuid);
    const orderComponents = [JSON.parse(order.rawOrderParams)];
    const txData = await BlockchainService.getCancelOrderTxData(orderComponents, seaport);
    const contractWithSigner = seaport.contract.connect(signer);
    const gasLimit = await contractWithSigner.estimateGas.cancel(orderComponents);
    const { transactionHash } = await BlockchainService.executeTransaction(contractWithSigner, txData, gasLimit);
    return transactionHash;
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
    await this.checkPaymentAccountBalance(signer, order.considerations[0]);
    const approved = await this.checkPaymentAllowance(signer, order.considerations[0]);
    console.log(`${Logger}: fulfillOrder, payment approved ${approved}`);
    if (!approved) {
      await this.makeConsiderationAllowance(signer, order.considerations[0]);
    }
    const orderComponents: OrderComponents = JSON.parse(order.rawOrderParams);
    const orderParams = { ...orderComponents, totalOriginalConsiderationItems: orderComponents.consideration.length };
    const orderStruct = { parameters: orderParams, signature: order.signature };
    const txData = await BlockchainService.getFulfillOrderTxData(orderStruct, seaport);
    const contractWithSigner = seaport.contract.connect(signer);
    const gasLimit = await contractWithSigner.estimateGas.fulfillOrder(orderStruct, NO_CONDUIT).catch((err) => {
      console.log(`${Logger}: error`);
      console.log({ err });
      // ref: https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts#L124
      const DEFAULT_GAS_LIMIT_MSG = 'execution reverted';
      if (err.error.data.message === DEFAULT_GAS_LIMIT_MSG) {
        return DEFAULT_GAS_LIMIT;
      }
      throw err;
    });
    const { transactionHash } = await BlockchainService.executeTransaction(contractWithSigner, txData, gasLimit);
    return transactionHash;
  }

  /**
   * Check if the offer asset is already approved by the seller.
   * @param signer
   * @param asset
   */
  async checkOfferAllowance(signer: ethers.providers.JsonRpcSigner, asset: AssetInstanceInterface): Promise<boolean> {
    const seaport = SeaportHelper.getSeaport(signer);
    const contract = BlockchainService.getNftContract(asset, signer);
    const account = await signer.getAddress();
    return contract.isApprovedForAll(account, seaport.contract.address);
  }

  /**
   * Check if the buying wallet has enough token balance.
   * @param signer
   * @param asset
   */
  async checkPaymentAccountBalance(
    signer: ethers.providers.JsonRpcSigner,
    asset: AssetInstanceInterface
  ): Promise<void> {
    const contract = BlockchainService.getPaymentContract(asset, signer);
    const price = BigNumber.from(asset.value!);
    const account = await signer.getAddress();
    const balance = (await contract.balanceOf(account)) as BigNumber;
    console.log(`${Logger}: checkPaymentAccountBalance, balance: ${balance.toString()}`);
    if (balance.lt(price)) {
      throw new Error('Not enough balance');
    }
  }

  /**
   * Check if the buying wallet has enough token approved.
   * @param signer
   * @param asset
   * @returns
   */
  async checkPaymentAllowance(signer: ethers.providers.JsonRpcSigner, asset: AssetInstanceInterface): Promise<boolean> {
    const seaport = SeaportHelper.getSeaport(signer);
    const contract = BlockchainService.getPaymentContract(asset, signer);
    const price = BigNumber.from(asset.value!);
    const account = await signer.getAddress();
    const allowance = (await contract.allowance(account, seaport.contract.address)) as BigNumber;
    console.log(`${Logger}: checkPaymentAllowance, allowance: ${allowance.toString()}`);
    if (allowance.lt(price)) {
      return false;
    }
    return true;
  }

  private convertItemType = (type: AssetType): ItemType => {
    switch (type) {
      case AssetType.ERC20:
        return ItemType.ERC20;
      case AssetType.ERC721:
        return ItemType.ERC721;
      case AssetType.ERC1155:
        return ItemType.ERC1155;
      case AssetType.Native:
        return ItemType.NATIVE;
      default:
        throw Error('Unknown AssetType');
    }
  };

  private getOfferFromOrder = (offer: AssetInstanceInterface): OfferItem[] => {
    const startAmount = offer.value!;
    return [
      {
        itemType: this.convertItemType(offer.type),
        token: offer.address,
        identifierOrCriteria: offer.tokenId!,
        startAmount,
        endAmount: startAmount
      }
    ];
  };
  private calculatePaymentSplitAmount = (value: string, percentage: string) => {
    const totalAmount = ethers.BigNumber.from(value);
    const splitAmount = totalAmount.mul(parseFloat(percentage) * this.percentageBase).div(this.percentageBase);

    return splitAmount;
  };

  private getSplitReceiver = (splitReceiver: SplitReceiver, offerer: string, shop: ShopResponse) => {
    switch (splitReceiver) {
      case SplitReceiver.ShopOwner:
        return shop.ownerAddress;
      case SplitReceiver.Seller:
        return offerer;
      case SplitReceiver.Platform:
        // TO FIX PLATFORM_ADDRESS
        return '0x358061bdbEfCb392105375D932Cc13c32f81A334';
      default:
        throw Error('invalid split receiver value');
    }
  };

  private getConsiderationFromOrder = (
    offerer: string,
    consideration: AssetInstanceInterface,
    shop: ShopResponse
  ): ConsiderationItem[] => {
    const shopSplit = shop.paymentSplit;
    let considerations: ConsiderationItem[] = [];
    for (const split of shopSplit) {
      const percentage = split.percentage;
      const splitReceiver = this.getSplitReceiver(split.receiver, offerer, shop);
      const startAmount = this.calculatePaymentSplitAmount(consideration.value!, percentage).toString();
      considerations.push({
        itemType: this.convertItemType(consideration.type),
        token: consideration.type === AssetType.ERC20 ? consideration.address : ethers.constants.AddressZero,
        startAmount,
        endAmount: startAmount,
        recipient: splitReceiver,
        identifierOrCriteria: '0'
      });
    }

    return considerations;
  };

  private getOfferConsiderationFromOrder(
    order: CreateOrderInterface,
    shop: ShopResponse
  ): {
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    totalOriginalConsiderationItems: number;
  } {
    if (order.offerNftAssets.length !== 1) throw Error('only 1 offer is supported');
    if (order.considerationAssets.length !== 1) throw Error('only 1 consideration is supported');
    const offer = this.getOfferFromOrder(order.offerNftAssets[0]);
    const consideration = this.getConsiderationFromOrder(order.offererAddress, order.considerationAssets[0], shop);
    return {
      offer,
      consideration,
      totalOriginalConsiderationItems: consideration.length
    };
  }

  toOrderParameters(createOrder: CreateOrderInterface, shop: ShopResponse): OrderParameters {
    const { offer, consideration, totalOriginalConsiderationItems } = this.getOfferConsiderationFromOrder(
      createOrder,
      shop
    );

    return {
      offerer: createOrder.offererAddress,
      zone: createOrder.additional.seaportZoneAddress,
      orderType: OrderType.FULL_OPEN,
      startTime: Math.floor(createOrder.createdAt / 1000).toString(),
      endTime: MAX_INT.toString(),
      zoneHash: formatBytes32String(createOrder.additional.seaportCounter.toString()),
      salt: createOrder.additional.seaportSalt,
      offer,
      consideration,
      totalOriginalConsiderationItems,
      conduitKey: NO_CONDUIT
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

export { ApiCaller };
