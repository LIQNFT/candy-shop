import { BaseShop } from '../base/BaseShop';
import { ShopSettings } from '../base/BaseShopModel';
import { EthereumSDK } from '../../factory/conveyor/eth';
import { MetamaskProvider } from '../../factory/conveyor/eth/types/sdk';
import { Blockchain } from '../../CandyShopModel';

export type EthNetwork = 'mainnet' | 'ropsten' | 'kovan' | 'rinkeby' | 'goerli';
interface CandyShopConstructorParams {
  candyShopCreatorAddress: string;
  treasuryMint: string;
  env: EthNetwork;
  settings?: Partial<ShopSettings>;
}

const DEFAULT_CURRENCY_SYMBOL = 'ETH';
const DEFAULT_CURRENCY_DECIMALS = 18;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = ''; // TODO

const sdk = new EthereumSDK();

export class EthCandyShop extends BaseShop {
  private _candyShopAddress: string;
  private _candyShopCreatorAddress: string;
  private _treasuryMint: string;
  private _env: string;
  private _settings: ShopSettings;
  private _baseUnitsPerCurrency: number;

  constructor(params: CandyShopConstructorParams) {
    super(params);
    const { candyShopCreatorAddress, treasuryMint, env, settings } = params;

    this._candyShopAddress = '45cc8c2a-6b17-495c-960e-99aac8fe5583'; // TODO: get candyShopAddress from backend
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._env = env ?? 'goerli';
    this._settings = {
      currencySymbol: settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
      currencyDecimals: settings?.currencyDecimals ?? DEFAULT_CURRENCY_DECIMALS,
      priceDecimals: settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      priceDecimalsMin: settings?.priceDecimalsMin ?? DEFAULT_PRICE_DECIMALS_MIN,
      volumeDecimals: settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
      volumeDecimalsMin: settings?.volumeDecimalsMin ?? DEFAULT_VOLUME_DECIMALS_MIN,
      mainnetConnectionUrl: settings?.mainnetConnectionUrl ?? DEFAULT_MAINNET_CONNECTION_URL,
      connectionConfig: settings?.connectionConfig
    };
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);
  }

  get candyShopAddress(): string {
    return this._candyShopAddress;
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

  get blockchain(): Blockchain {
    return Blockchain.Ethereum;
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

  async buy(params: { metamaskProvider: MetamaskProvider; event: any; address: string }): Promise<string> {
    let { metamaskProvider, event, address } = params;
    let response = await sdk.fulfillOrder(metamaskProvider, event, address);
    return response.transactionHash;
  }

  async sell(params: { address: string; data: any }): Promise<string> {
    let { address, data } = params;
    let response = await sdk.createOrder(address, data);
    return response.transactionHash;
  }

  async cancel(params: { metamaskProvider: MetamaskProvider; orderUuid: string; address: string }): Promise<string> {
    let { metamaskProvider, orderUuid, address } = params;
    let response = await sdk.cancelOrder(metamaskProvider, orderUuid, address);
    return response.transactionHash;
  }

  // Auction
  createAuction(params: any): Promise<string> {
    return Promise.resolve('cancel txhash');
  }

  cancelAuction(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  bidAuction(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  withdrawAuctionBid(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  buyNowAuction(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  settleAndDistributeAuctionProceeds(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  // Edition Drop
  commitMasterNft(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  mintNewPrint(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }

  redeemDrop(params: any): Promise<string> {
    return Promise.resolve('Not supported');
  }
}
