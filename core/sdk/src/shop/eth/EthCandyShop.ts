import { ItemType } from '@opensea/seaport-js/lib/constants';
import { CreateInputItem } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';

import { Blockchain } from '@liqnft/candy-shop-types';
import { BaseShop, BaseShopConstructorParams } from '../base/BaseShop';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';
import { EthereumSDK, SeaportHelper } from '../../factory/conveyor/eth';
import { safeAwait, SingleTokenInfo } from '../../vendor';
import { fetchShopsByIdentifier } from '../../CandyShopInfoAPI';
import Decimal from 'decimal.js';

const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;

const Logger = 'EthCandyShop';

export interface EthShopConstructorParams extends BaseShopConstructorParams {}
export interface EthShopInitParams extends Omit<EthShopConstructorParams, 'settings'> {
  settings: Partial<ShopSettings>;
}

/**
 * @class EthCandyShop with private constructor, use public static method to instantiate the object.
 */
export class EthCandyShop extends BaseShop {
  private _candyShopAddress: string;
  private ethereumSDK: EthereumSDK;

  /**
   * Involve the asynchronous fetch for required shop details to create EthCandyShop.
   * @returns EthCandyShop
   */
  static async initEthCandyShop(params: EthShopInitParams): Promise<EthCandyShop> {
    // Must config the endpoint before calling any CandyShop API
    BaseShop.configEndpoint(params.env);

    // Fetch required details for EVM setup
    const shopDetail = await safeAwait(
      fetchShopsByIdentifier(params.shopCreatorAddress, params.treasuryMint, params.programId)
    );

    if (shopDetail.error || !shopDetail.result || !shopDetail.result.success) {
      throw new Error(`${Logger} init, fetchShopsByIdentifier failed=${shopDetail.result?.msg}`);
    }

    const shopResponse = shopDetail.result.result;

    // Assign settings if any or fallback to default
    const candyShopSettings: ShopSettings = {
      currencySymbol: shopResponse.symbol,
      currencyDecimals: shopResponse.decimals,
      priceDecimals: params.settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      priceDecimalsMin: params.settings?.priceDecimalsMin ?? DEFAULT_PRICE_DECIMALS_MIN,
      volumeDecimals: params.settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
      volumeDecimalsMin: params.settings?.volumeDecimalsMin ?? DEFAULT_VOLUME_DECIMALS_MIN,
      connectionUrl: params.settings?.connectionUrl,
      connectionConfig: params.settings?.connectionConfig,
      explorerLink: params.settings?.explorerLink ?? ExplorerLinkBase.Polygon
    };

    const ethParams: EthShopConstructorParams = {
      ...params,
      settings: candyShopSettings
    };

    const ethCandyShop = new EthCandyShop(shopResponse.candyShopAddress, ethParams);
    return ethCandyShop;
  }

  get candyShopAddress(): string {
    return this._candyShopAddress;
  }

  get explorerLink(): ExplorerLinkBase {
    return this._settings.explorerLink;
  }

  get version(): CandyShopVersion {
    return CandyShopVersion.V1;
  }

  private constructor(shopAddress: string, params: EthShopConstructorParams) {
    const { programId, shopCreatorAddress, treasuryMint, env, settings } = params;

    const baseShopParams: BaseShopConstructorParams = {
      programId,
      shopCreatorAddress,
      treasuryMint,
      env: env ?? Blockchain.Eth,
      settings
    };

    // Apply common params to BaseShop
    super(baseShopParams);
    this._candyShopAddress = shopAddress;
    this.ethereumSDK = new EthereumSDK();

    console.log(`${Logger} constructor: instantiated EthCandyShop=`, this);
  }

  /**
   * 1. Perform validation and check if user has enough token allowance and has enough balance.
   * 2. If validation does not pass, try to get users to approve more allowance.
   * 3. Fulfill the order.
   * @param params
   * @returns
   */
  async buy(params: { providers: any; orderUuid: string }): Promise<string> {
    const { providers, orderUuid } = params;
    const provider = new ethers.providers.Web3Provider(providers);
    const wallet = provider.getSigner();
    const txHash = await this.ethereumSDK.fulfillOrder(wallet, orderUuid);
    return txHash;
  }

  /**
   * 1. Get user to approve the NFT token allowance.
   * 2. Make the create Order request for order registration.
   * @param params
   * @returns
   */
  async sell(params: { providers: any; nft: SingleTokenInfo; price: number }): Promise<string> {
    const { providers, nft, price } = params;

    const provider = new ethers.providers.Web3Provider(providers);
    const wallet = provider.getSigner();
    const seaport = SeaportHelper.getSeaport(wallet);
    const shopResult = await this.ethereumSDK.getShopByUuid(this.candyShopAddress);
    const shop = shopResult.result;

    const offerer = await wallet.getAddress();
    const priceValue = new Decimal(`${price}e${this.currencyDecimals}`).toString();
    const consideration = this.ethereumSDK.getConsiderationFromOrder(
      offerer,
      { address: shop.paymentAssets[0].address, type: shop.paymentAssets[0].type, value: priceValue },
      shop
    );

    let itemType = ItemType.ERC721;
    if (nft.itemType === 'ERC1155') {
      itemType = ItemType.ERC1155;
    }

    const offer: CreateInputItem[] = [
      {
        identifier: nft.tokenAccountAddress,
        itemType,
        token: nft.tokenMintAddress.split(':')[0],
        amount: '1'
      }
    ];

    const { executeAllActions } = await seaport
      .createOrder(
        {
          offer,
          consideration
        },
        offerer
      )
      .catch((err: Error) => {
        console.log(`${Logger}, failed to createOrder, err=${err.message}`);
        throw err;
      });

    const orderRes = await executeAllActions().catch((err: Error) => {
      console.log(`${Logger}, failed to executeAllActions, err=${err.message}`);
      console.log(err);
      throw err;
    });

    const { signature, parameters } = orderRes;
    const data = {
      signature,
      orderData: this.ethereumSDK.convertToSeaportOrderData(parameters),
      shopUuid: shop.uuid
    };
    const orderResult = await this.ethereumSDK.createOrder(data);
    return orderResult.uuid;
  }

  async cancel(params: { providers: any; orderUuid: string }): Promise<string> {
    const { providers, orderUuid } = params;
    const provider = new ethers.providers.Web3Provider(providers);
    const wallet = provider.getSigner();
    const txHash = await this.ethereumSDK.cancelOrder(wallet, orderUuid);
    return txHash;
  }
}
