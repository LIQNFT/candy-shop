import { BaseShop } from '../base/BaseShop';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';
import { EthereumSDK } from '../../factory/conveyor/eth/conveyor';
import { ethers } from 'ethers';
import { configBaseUrl, safeAwait, SingleTokenInfo } from '../../vendor';
import { ApiCaller } from '../../factory/conveyor/eth/api';
import {
  Blockchain,
  CandyShop,
  ListBase,
  Nft,
  Order,
  OrdersEditionFilterQuery,
  OrdersFilterQuery,
  ShopStats,
  SingleBase,
  Trade,
  TradeQuery,
  WhitelistNft
} from '@liqnft/candy-shop-types';
import { SeaportHelper } from '../../factory/conveyor/eth/seaport';
import { fetchShopsByIdentifier } from '../../CandyShopInfoAPI';
import Decimal from 'decimal.js';
import { Program, Idl } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import { CreateInputItem } from '@opensea/seaport-js/lib/types';
import { SeaportOrderData } from '../../factory/conveyor/eth/types/order.type';

interface CandyShopConstructorParams {
  candyShopCreatorAddress: string;
  treasuryMint: string;
  programId: string;
  env: Blockchain;
  settings?: Partial<ShopSettings>;
}

const DEFAULT_CURRENCY_SYMBOL = 'ETH';
const DEFAULT_CURRENCY_DECIMALS = 18;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = ''; // TODO
const ETH_BACKEND_STAGING_URL = 'https://ckaho.liqnft.com/api/eth';
const ETH_BACKEND_PROD_URL = 'https://candy-shop.liqnft.com/api/eth';

const Logger = 'EthCandyShop';

/**
 * @class EthCandyShop
 */

export class EthCandyShop extends BaseShop {
  private _candyShopAddress: string = '';
  private _candyShopCreatorAddress: string;
  private _treasuryMint: string;
  private _env: Blockchain;
  private _settings: ShopSettings;
  private _baseUnitsPerCurrency: number;

  set candyShopAddress(shopUuid: string) {
    this._candyShopAddress = shopUuid;
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

  get candyShopCreatorAddress(): string {
    return this._candyShopCreatorAddress;
  }

  get treasuryMint(): string {
    return this._treasuryMint;
  }

  get settings(): Partial<ShopSettings> {
    return this._settings;
  }

  get env(): Blockchain {
    return this._env;
  }

  get baseUnitsPerCurrency(): number {
    return this._baseUnitsPerCurrency;
  }

  get currencySymbol(): string {
    return this._settings.currencySymbol;
  }

  get currencyDecimals(): number {
    return this._settings.currencyDecimals;
  }

  get priceDecimals(): number {
    return this._settings.priceDecimals;
  }

  get priceDecimalsMin(): number {
    return this._settings.priceDecimalsMin;
  }

  get volumeDecimals(): number {
    return this._settings.volumeDecimals;
  }

  get volumeDecimalsMin(): number {
    return this._settings.volumeDecimalsMin;
  }

  /**
   * Instantiate a EthCandyShop object
   *
   * @constructor
   * @param {CandyShopConstructorParams} params
   */

  constructor(params: CandyShopConstructorParams, private ethereumSDK: EthereumSDK) {
    super(params);
    const { candyShopCreatorAddress, treasuryMint, env, settings } = params;

    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._env = env ?? Blockchain.Eth;
    this._settings = {
      currencySymbol: settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
      currencyDecimals: settings?.currencyDecimals ?? DEFAULT_CURRENCY_DECIMALS,
      priceDecimals: settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      priceDecimalsMin: settings?.priceDecimalsMin ?? DEFAULT_PRICE_DECIMALS_MIN,
      volumeDecimals: settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
      volumeDecimalsMin: settings?.volumeDecimalsMin ?? DEFAULT_VOLUME_DECIMALS_MIN,
      mainnetConnectionUrl: settings?.mainnetConnectionUrl ?? DEFAULT_MAINNET_CONNECTION_URL,
      connectionConfig: settings?.connectionConfig,
      explorerLink: settings?.explorerLink ?? ExplorerLinkBase.Polygon
    };
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);
    console.log('EthCandyShop constructor: init CandyShop=', this);
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

  createAuction(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  cancelAuction(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  bidAuction(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  withdrawAuctionBid(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  buyNowAuction(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  settleAndDistributeAuctionProceeds(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  commitMasterNft(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  mintNewPrint(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  redeemDrop(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  verifyProgramId(programId: PublicKey): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getStaticProgram(wallet: AnchorWallet | Keypair): Program<Idl> {
    throw new Error('Method not implemented.');
  }
  updateCandyShop(params: any): Promise<string> {
    throw new Error('Method not implemented.');
  }
  stats(): Promise<ShopStats> {
    throw new Error('Method not implemented.');
  }
  transactions(queryDto: TradeQuery): Promise<ListBase<Trade>> {
    throw new Error('Method not implemented.');
  }
  nftInfo(mint: string): Promise<Nft> {
    throw new Error('Method not implemented.');
  }
  orders(ordersFilterQuery: OrdersFilterQuery): Promise<ListBase<Order>> {
    throw new Error('Method not implemented.');
  }
  childEditionOrders(masterMint: string, ordersEditionFilterQuery: OrdersEditionFilterQuery): Promise<ListBase<Order>> {
    throw new Error('Method not implemented.');
  }
  activeOrdersByWalletAddress(walletAddress: string): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }
  shopWlNfts(): Promise<ListBase<WhitelistNft>> {
    throw new Error('Method not implemented.');
  }
  activeOrderByMintAddress(mintAddress: string): Promise<SingleBase<Order>> {
    throw new Error('Method not implemented.');
  }
  fetchShopByShopId(): Promise<SingleBase<CandyShop>> {
    throw new Error('Method not implemented.');
  }
}

export async function getEthCandyShop(params: CandyShopConstructorParams): Promise<EthCandyShop | undefined> {
  const isProduction =
    params.env === Blockchain.SolMainnetBeta || params.env === Blockchain.Eth || params.env === Blockchain.Polygon;
  const url = isProduction ? ETH_BACKEND_PROD_URL : ETH_BACKEND_STAGING_URL;
  const apiCaller = new ApiCaller(url);
  const ethereumSDK = new EthereumSDK(apiCaller);
  configBaseUrl(url.slice(0, -4));

  const shopDetailRes = await safeAwait(
    fetchShopsByIdentifier(params.candyShopCreatorAddress, params.treasuryMint, params.programId)
  );
  if (shopDetailRes.error || !shopDetailRes.result.success) {
    console.log(`${Logger} fetchShopsByIdentifier failed, error=`, { shopDetailRes });
  }

  const shopDetails = shopDetailRes.result?.result!;
  if (!params.settings) {
    params.settings = {};
  }

  params.settings.currencySymbol = shopDetails.symbol;
  params.settings.currencyDecimals = shopDetails.decimals;
  const ethCandyShop = new EthCandyShop(params, ethereumSDK);
  ethCandyShop.candyShopAddress = shopDetails.candyShopAddress;
  return ethCandyShop;
}
