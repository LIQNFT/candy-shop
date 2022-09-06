import { RequestMethod } from './types/api';
import { BaseTransactionResult, BlockchainPrivateParams } from './types/blockchain';
import { BlockchainAccountAccessType } from './types/blockchain/account';
import { EthereumSDKInterface, MetamaskProvider } from './types/sdk';
import { ApiCaller } from './api';
import BlockchainService from './blockchain';
import { PaymentSplitInterface, SplitReceiver } from './types/shop';

export class EthereumSDK implements EthereumSDKInterface {
  private blockchainService = new BlockchainService();

  makeConsumptionAllowance = async (
    metamaskProvider: string,
    consumptionUuid: string,
    address: string
  ): Promise<BaseTransactionResult> => {
    const result = await ApiCaller.request('/order/consumption/${consumptionUuid}/allowance', RequestMethod.Get, {});
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const network = await provider.getNetwork();
    const baseParams: BlockchainPrivateParams = {
      networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
      access: {
        address: providerAddress,
        type: BlockchainAccountAccessType.Provider,
        provider: provider
      }
    };
    const order = await this.blockchainService.getBlockchainOrderByConsumptionUuid(consumptionUuid);
    return await this.blockchainService.makeOrderConsumptionAllowance(baseParams, order, result.result.transactionData);
  };

  createShop = async (metamaskProvider: MetamaskProvider, event: any, address: string): Promise<any> => {
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const percentage: PaymentSplitInterface[] = [
      {
        receiver: SplitReceiver.Seller,
        percentage: event.percentage.seller
      },
      {
        receiver: SplitReceiver.ShopOwner,
        percentage: event.percentage.shopOwner
      },
      {
        receiver: SplitReceiver.Platform,
        percentage: event.percentage.platform
      }
    ];
    const network = await provider.getNetwork();
    const signature = await this.blockchainService.signCreateShopAction(
      {
        networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
        access: {
          address: providerAddress,
          type: BlockchainAccountAccessType.Provider,
          provider: provider
        }
      },
      {
        ownerAddress: address,
        name: event.name,
        paymentSplit: percentage,
        logoUrl: event.logoUrl
      }
    );

    return await ApiCaller.request('/shop', RequestMethod.Post, {
      name: event.name,
      ownerAddress: address,
      paymentSplit: percentage,
      logoUrl: event.logoUrl,
      signature
    });
  };

  updateShop = async (metamaskProvider: MetamaskProvider, event: any, address: string): Promise<any> => {
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);

    const percentage: PaymentSplitInterface[] = [
      {
        receiver: SplitReceiver.Seller,
        percentage: event.percentage.seller
      },
      {
        receiver: SplitReceiver.ShopOwner,
        percentage: event.percentage.shopOwner
      },
      {
        receiver: SplitReceiver.Platform,
        percentage: event.percentage.platform
      }
    ];

    const network = await provider.getNetwork();
    const signature = await this.blockchainService.signUpdateShopAction(
      {
        networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
        access: {
          address: providerAddress,
          type: BlockchainAccountAccessType.Provider,
          provider: provider
        }
      },
      {
        name: event.name,
        paymentSplit: percentage,
        logoUrl: event.logoUrl
      }
    );
    return await ApiCaller.request(`/shop/${event.uuid}`, RequestMethod.Patch, {
      name: event.name,
      paymentSplit: percentage,
      logoUrl: event.logoUrl,
      signature
    });
  };

  deleteShop = async (metamaskProvider: MetamaskProvider, event: any, address: string): Promise<void> => {
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const network = await provider.getNetwork();
    const signature = await this.blockchainService.signDeleteShopAction(
      {
        networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
        access: {
          address: providerAddress,
          type: BlockchainAccountAccessType.Provider,
          provider: provider
        }
      },
      {
        ...event
      }
    );

    await ApiCaller.request(`/shop/{uuid}?uuid=${event.uuid}&signature=${signature}`, RequestMethod.Delete, {});
  };

  fulfillOrder = async (
    metamaskProvider: MetamaskProvider,
    event: any,
    address: string
  ): Promise<BaseTransactionResult> => {
    const result = await ApiCaller.request(
      `/order/consumption/${event.consumptionUuid}/fulfill`,
      RequestMethod.Get,
      {}
    );
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const network = await provider.getNetwork();
    const baseParams: BlockchainPrivateParams = {
      networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
      access: {
        address: providerAddress,
        type: BlockchainAccountAccessType.Provider,
        provider: provider
      }
    };
    const order = await this.blockchainService.getBlockchainOrderByConsumptionUuid(event.consumptionUuid);
    return await this.blockchainService.fulfillOrder(baseParams, order, result.result.transactionData);
  };

  getOrder = async (uuid: string) => {
    return await ApiCaller.request(`/order/${uuid}`, RequestMethod.Get, {});
  };

  makeOfferAllowance = async (
    metamaskProvider: string,
    consumptionUuid: string,
    address: string
  ): Promise<BaseTransactionResult> => {
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const network = await provider.getNetwork();
    const baseParams: BlockchainPrivateParams = {
      networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
      access: {
        address: providerAddress,
        type: BlockchainAccountAccessType.Provider,
        provider: provider
      }
    };
    const order = await this.blockchainService.getBlockchainOrderByConsumptionUuid(consumptionUuid);
    return await this.blockchainService.makeOrderOfferAllowance(baseParams, order, consumptionUuid);
  };

  makeOrderConsumptionSignature = async (
    metamaskProvider: string,
    consumptionUuid: string,
    address: string
  ): Promise<any> => {
    const { provider, providerAddress } = await this.blockchainService.getParamData(metamaskProvider, address);
    const network = await provider.getNetwork();
    const baseParams: BlockchainPrivateParams = {
      networkInfo: await this.blockchainService.getNetworkInfo(network.chainId),
      access: {
        address: providerAddress,
        type: BlockchainAccountAccessType.Provider,
        provider: provider
      }
    };

    const signature = await this.blockchainService.signOrderConsumption(baseParams, {
      uuid: consumptionUuid
    });

    return await ApiCaller.request('/order/signature', RequestMethod.Post, {
      consumptionUuid,
      signature
    });
  };

  getShop = async (uuid: string) => {
    return await ApiCaller.request(`/shop/${uuid}`, RequestMethod.Get, {});
  };

  createOrder = async (address: string, data: any) => {
    data.offerNftAsset.type = Number(data.offerNftAsset.type);
    data.consumptionPaymentAssets[0].type = Number(data.consumptionPaymentAssets[0].type);
    data.networkId = Number(data.networkId);
    return await ApiCaller.request('/order', RequestMethod.Post, {
      offererAddress: address,
      ...data
    });
  };

  cancelOrder = async (
    metamaskProvider: MetamaskProvider,
    orderUuid: string,
    address: string
  ): Promise<BaseTransactionResult> => {
    return await this.blockchainService.cancelOrder(metamaskProvider, orderUuid, address);
  };
}
