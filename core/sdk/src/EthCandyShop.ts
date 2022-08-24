import { CandyShop } from './CandyShop';
import { Blockchain } from './CandyShopModel';
import { EthereumSDK } from './factory/conveyor/eth';
import { MetamaskProvider } from './factory/conveyor/eth/types/sdk';

interface CandyShopSettings {
  /** Shop transaction currency symbol (default is ETH) */
  currencySymbol: string;
  /** Shop transaction currency decimals (default is 18 for ETH) */
  currencyDecimals: number;
  /** Number of min decimals to display for price numbers (default is 0) */
  priceDecimalsMin: number;
  /** Number of max decimals to display for price numbers (default is 3) */
  priceDecimals: number;
  /** Number of min decimals to display for volume numbers (default is 0) */
  volumeDecimalsMin: number;
  /** Number of max decimals to display for volume numbers (default is 1) */
  volumeDecimals: number;
  /** Rpc connection endpoint */
  mainnetConnectionUrl: string;
  /** Connection config options */
  connectionConfig: object | undefined;
}

interface CandyShopConstructorParams {
  candyShopCreatorAddress: string;
  treasuryMint: string;
  env: 'mainnet' | 'ropsten' | 'kovan' | 'rinkeby' | 'goerli';
  settings?: Partial<CandyShopSettings>;
  // programId --> not used in ETH
  // isEnterprise --> not used in ETH
}

const DEFAULT_CURRENCY_SYMBOL = 'ETH';
const DEFAULT_CURRENCY_DECIMALS = 18;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = ''; // TODO

const sdk = new EthereumSDK();

export class EthCandyShop implements CandyShop {
  private _candyShopAddress: string;
  private _candyShopCreatorAddress: string;
  private _treasuryMint: string;
  private _env: string;
  private _settings: CandyShopSettings;
  // _version, _isEnterprise, _programId not used in ETH

  constructor(params: CandyShopConstructorParams) {
    const { candyShopCreatorAddress, treasuryMint, env, settings } = params;

    this._candyShopAddress = ''; // TODO: get candyShopAddress from backend
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
  }

  shopId(): string {
    return this._candyShopAddress;
  }

  ownerAddress(): string {
    return this._candyShopCreatorAddress;
  }

  treasuryMint(): string {
    return this._treasuryMint;
  }

  settings(): Partial<CandyShopSettings> {
    return this._settings;
  }

  blockchain(): Blockchain {
    return Blockchain.Ethereum;
  }

  async marketplaceBuy(params: { metamaskProvider: MetamaskProvider; event: any; address: string }): Promise<string> {
    let { metamaskProvider, event, address } = params;
    let response = await sdk.fulfillOrder(metamaskProvider, event, address);
    return response.transactionHash;
  }

  async marketplaceSell(params: { address: string; data: any }): Promise<string> {
    let { address, data } = params;
    let response = await sdk.createOrder(address, data);
    return response.transactionHash;
  }

  async marketplaceCancel(params: {
    metamaskProvider: MetamaskProvider;
    orderUuid: string;
    address: string;
  }): Promise<string> {
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
