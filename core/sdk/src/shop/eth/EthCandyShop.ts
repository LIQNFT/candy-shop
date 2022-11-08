import { ItemType } from '@opensea/seaport-js/lib/constants';
import { CreateInputItem } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';

import { Blockchain } from '@liqnft/candy-shop-types';
import { BaseShop, BaseShopConstructorParams } from '../base/BaseShop';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';
import { EthereumSDK, SeaportHelper } from '../../factory/conveyor/eth';
import { configBaseUrl, getBaseUrl, safeAwait, SingleTokenInfo } from '../../vendor';
import { fetchShopsByIdentifier } from '../../CandyShopInfoAPI';
import Decimal from 'decimal.js';

const DEFAULT_CURRENCY_SYMBOL = 'ETH';
const DEFAULT_CURRENCY_DECIMALS = 18;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = ''; // TODO

const Logger = 'EthCandyShop';

export interface EthShopConstructorParams extends BaseShopConstructorParams {}
export interface EthShopInitParams extends Omit<BaseShopConstructorParams, 'settings'> {
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
    const baseUrl = getBaseUrl(params.env);
    configBaseUrl(baseUrl);

    // Assign settings if any or fallback to default
    const candyShopSettings: ShopSettings = {
      currencySymbol: params.settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
      currencyDecimals: params.settings?.currencyDecimals ?? DEFAULT_CURRENCY_DECIMALS,
      priceDecimals: params.settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      priceDecimalsMin: params.settings?.priceDecimalsMin ?? DEFAULT_PRICE_DECIMALS_MIN,
      volumeDecimals: params.settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
      volumeDecimalsMin: params.settings?.volumeDecimalsMin ?? DEFAULT_VOLUME_DECIMALS_MIN,
      mainnetConnectionUrl: params.settings?.mainnetConnectionUrl ?? DEFAULT_MAINNET_CONNECTION_URL,
      connectionConfig: params.settings?.connectionConfig,
      explorerLink: params.settings?.explorerLink ?? ExplorerLinkBase.Polygon
    };

    // Fetch required details for EVM setup
    const shopDetail = await safeAwait(
      fetchShopsByIdentifier(params.shopCreatorAddress, params.treasuryMint, params.programId)
    );

    if (shopDetail.error || !shopDetail.result || !shopDetail.result.success) {
      console.log(`${Logger} initEthCandyShop, fetchShopsByIdentifier failed=`, shopDetail);
      throw new Error(`${Logger} init error`);
    }

    const ethParams: EthShopConstructorParams = {
      ...params,
      settings: candyShopSettings
    };

    const shopResponse = shopDetail.result.result;
    ethParams.settings.currencySymbol = shopResponse.symbol;
    ethParams.settings.currencyDecimals = shopResponse.decimals;
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
    this.ethereumSDK = new EthereumSDK(this.baseUrl);

    console.log(`${Logger} constructor: init EthCandyShop=`, this);
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
    let { providers, nft, price } = params;

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

    const offer: CreateInputItem[] = [
      {
        identifier: nft.tokenAccountAddress,
        itemType: ItemType.ERC721,
        token: nft.tokenMintAddress.split(':')[0]
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
