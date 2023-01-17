import { ItemType } from '@opensea/seaport-js/lib/constants';
import { CreateInputItem } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';

import { Blockchain } from '@liqnft/candy-shop-types';
import { BaseShop, BaseShopConstructorParams } from '../base/BaseShop';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';
import { EthereumPort, ExecuteOrderParams } from '../../factory/conveyor/eth';
import { safeAwait, SingleTokenInfo } from '../../vendor';
import { fetchShopsByIdentifier } from '../../CandyShopInfoAPI';

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
  private ethereumPort: EthereumPort;

  /**
   * Involve the asynchronous fetch for required shop details to create EthCandyShop.
   * @returns EthCandyShop
   */
  static async initEthCandyShop(params: EthShopInitParams): Promise<EthCandyShop> {
    // Must config the endpoint before calling any CandyShop API
    BaseShop.configEndpoint(params.env);

    // Fetch required details for EVM setup
    const shopDetail = await safeAwait(
      fetchShopsByIdentifier(params.shopCreatorAddress, params.treasuryMint, params.programId, params.env)
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
      // TBD: If EthCandyShop doesn't need connectionUrl, should not provide it in common ShopSettings
      connectionUrl: params.settings?.connectionUrl ?? '',
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
    this.ethereumPort = new EthereumPort();

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
    const txHash = await this.ethereumPort.fulfillOrder(wallet, orderUuid);
    return txHash;
  }

  /**
   * 1. Get user to approve the NFT token allowance.
   * 2. Execute Order request for order registration.
   * @param params
   * @property {number} price: user input value on the UI with minimum value with maximum number of fraction is 3
   * @returns
   */
  async sell(params: { providers: any; nft: SingleTokenInfo; price: number }): Promise<string> {
    const { providers, nft, price } = params;

    const provider = new ethers.providers.Web3Provider(providers);
    const wallet = provider.getSigner();
    const shopResult = await this.ethereumPort.getShopByUuid(this.candyShopAddress);
    const shop = shopResult.result;

    const offerer = await wallet.getAddress();
    const priceValue = ethers.BigNumber.from(price * 1000)
      .mul(ethers.BigNumber.from(10).pow(this.currencyDecimals))
      .div(1000)
      .toString();

    const consideration = this.ethereumPort.getConsiderationFromOrder(
      offerer,
      { address: shop.paymentAssets[0].address, type: shop.paymentAssets[0].type, value: priceValue },
      shop
    );

    const itemType = nft.itemType === 'ERC1155' ? ItemType.ERC1155 : ItemType.ERC721;

    const offer: CreateInputItem[] = [
      {
        identifier: nft.tokenAccountAddress,
        itemType,
        token: nft.tokenMintAddress.split(':')[0],
        amount: '1'
      }
    ];

    const executeOrderParams: ExecuteOrderParams = {
      shopUuid: shop.uuid,
      signer: wallet,
      createOrderInput: {
        offer,
        consideration
      },
      accountAddress: offerer
    };

    const OrderUuid = await this.ethereumPort.executeOrder(executeOrderParams);
    return OrderUuid;
  }

  async cancel(params: { providers: any; orderUuid: string }): Promise<string> {
    const { providers, orderUuid } = params;
    const provider = new ethers.providers.Web3Provider(providers);
    const wallet = provider.getSigner();
    const txHash = await this.ethereumPort.cancelOrder(wallet, orderUuid);
    return txHash;
  }

  getNftPurchasePayload(params: { buyerAddress: string; orderUuid: string }) {
    const { buyerAddress, orderUuid } = params;
    return this.ethereumPort.getFulfillOrderPayloadByUuidAndBuyerAddress(orderUuid, buyerAddress);
  }
}
