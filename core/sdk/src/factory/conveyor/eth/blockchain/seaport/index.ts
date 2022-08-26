import { ethers } from 'ethers';
import { BlockchainOrderInterface, BlockchainOrderPaymentAssetSplit, TypedDataDomain } from '../../types/blockchain';
import { EIP_712_ORDER_TYPE, ItemType, MAX_INT, NO_CONDUIT, OrderType } from '@opensea/seaport-js/lib/constants';
import { AssetType } from '../../types/asset';
import { ConsiderationItem, OfferItem, OrderComponents, OrderParameters } from '@opensea/seaport-js/lib/types';
import { ERC1155AssetInstance } from '../../types/asset-instance/token';
import { PaymentAssetInstance } from '../../types/asset-instance';
import { formatBytes32String } from 'ethers/lib/utils';
import { BlockchainProvider } from '../../types/blockchain/account';
import { Seaport } from '@opensea/seaport-js';
import { generateRandomSalt } from '@opensea/seaport-js/lib/utils/order';
import { SeaportHelperInterface } from '../../types/blockchain/seaport';

export class SeaportHelper implements SeaportHelperInterface {
  private percentageBase = ethers.utils.parseEther('1');

  private getStartTimeFromOrder = (order: BlockchainOrderInterface) => {
    return Math.floor(new Date(order.createdAt).getTime() / 1000).toString();
  };

  private getEndTime = () => {
    return MAX_INT.toString();
  };

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

  private getOfferFromOrder = (order: BlockchainOrderInterface): OfferItem[] => {
    if (!order.offer.asset) throw Error('Invalid asset');
    const startAmount =
      order.offer.asset.type === AssetType.ERC1155
        ? ethers.utils.parseEther((order.offer as ERC1155AssetInstance).value).toString()
        : '1';
    return [
      {
        itemType: this.convertItemType(order.offer.asset.type),
        token: order?.offer?.asset.address,
        identifierOrCriteria: order?.offer.tokenId,
        startAmount,
        endAmount: startAmount
      }
    ];
  };

  private calculatePaymentSplitAmount = (
    paymentSplit: BlockchainOrderPaymentAssetSplit,
    selectedConsumption: PaymentAssetInstance
  ) => {
    const totalAmount = ethers.utils.parseEther(selectedConsumption.value);
    const splitAmount = totalAmount.mul(ethers.utils.parseEther(paymentSplit.percentage)).div(this.percentageBase);

    return splitAmount;
  };

  private getConsiderationFromOrder = (order: BlockchainOrderInterface): ConsiderationItem[] => {
    const selectedConsumptionAssetInstance = order.selectedConsumption.assetInstance;
    if (!selectedConsumptionAssetInstance) throw Error('Invalid consumption');
    return order.payments.map((paymentSplit) => {
      const startAmount = this.calculatePaymentSplitAmount(paymentSplit, selectedConsumptionAssetInstance).toString();
      if (!selectedConsumptionAssetInstance.asset) throw Error('Invalid asset');
      return {
        itemType: this.convertItemType(selectedConsumptionAssetInstance.asset.type),
        token:
          selectedConsumptionAssetInstance?.asset?.type === AssetType.ERC20
            ? selectedConsumptionAssetInstance.asset.address
            : ethers.constants.AddressZero,
        startAmount,
        endAmount: startAmount,
        recipient: paymentSplit.receiverAddress,
        identifierOrCriteria: '0'
      };
    });
  };

  convertOrderToOrderParameters = (order: BlockchainOrderInterface): OrderParameters => {
    const offer = this.getOfferFromOrder(order);
    const consideration = this.getConsiderationFromOrder(order);
    const totalOriginalConsiderationItems = consideration.length;
    if (!order.additional) throw Error('Invalid additional info');
    return {
      offerer: order.offererAddress,
      zone: order.additional.seaportZoneAddress,
      orderType: OrderType.FULL_OPEN,
      startTime: this.getStartTimeFromOrder(order),
      endTime: this.getEndTime(),
      zoneHash: formatBytes32String(order.additional.seaportCounter.toString()),
      salt: order.additional.seaportSalt,
      offer,
      consideration,
      totalOriginalConsiderationItems,
      conduitKey: NO_CONDUIT
    };
  };

  convertOrderToOrderComponents = (order: BlockchainOrderInterface): OrderComponents => {
    if (!order.additional) throw Error('Invalid additional info');
    return {
      ...this.convertOrderToOrderParameters(order),
      counter: order.additional.seaportCounter
    };
  };

  getSeaport = (provider: BlockchainProvider) => {
    return new Seaport(provider);
  };

  getDomainData = async (seaport: Seaport): Promise<TypedDataDomain> => {
    return (await (seaport as any)._getDomainData()) as TypedDataDomain;
  };

  getSignatureTypes = () => {
    return EIP_712_ORDER_TYPE;
  };

  getRandomSalt = () => {
    return generateRandomSalt();
  };
}
