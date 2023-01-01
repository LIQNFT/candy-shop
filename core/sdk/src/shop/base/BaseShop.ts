import { Blockchain } from '@liqnft/candy-shop-types';
import { configBaseUrl, getBaseUrl } from '../../vendor';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from './BaseShopModel';

/**
 * Optional implementation that will coupled with shop instance
 */
export interface CandyShopAuctioneer {
  createAuction(params: any): Promise<string>;
  cancelAuction(params: any): Promise<string>;
  bidAuction(params: any): Promise<string>;
  withdrawAuctionBid(params: any): Promise<string>;
  buyNowAuction(params: any): Promise<string>;
  settleAndDistributeAuctionProceeds(params: any): Promise<string>;
}

export interface CandyShopEditionDropper {
  commitMasterNft(params: any): Promise<string>;
  mintNewPrint(params: any): Promise<string>;
  redeemDrop(params: any): Promise<string>;
  updateEditionVault(params: any): Promise<string>;
}

export interface BaseShopConstructorParams {
  shopCreatorAddress: string;
  treasuryMint: string;
  programId: string;
  env: Blockchain;
  settings: ShopSettings;
}

export abstract class BaseShop {
  // Aggregate common params as common getters in BaseShop
  protected _shopCreatorAddress: string;
  protected _treasuryMint: string;
  protected _programId: string;
  protected _env: Blockchain;
  protected _settings: ShopSettings;
  protected _baseUnitsPerCurrency: number;

  get candyShopCreatorAddress(): string {
    return this._shopCreatorAddress;
  }

  get treasuryMint(): string {
    return this._treasuryMint;
  }

  get programId(): string {
    return this._programId;
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

  get currencyDecimals(): number {
    return this._settings.currencyDecimals;
  }

  get currencySymbol(): string {
    return this._settings.currencySymbol;
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

  get explorerLink(): ExplorerLinkBase {
    return this._settings.explorerLink;
  }

  constructor(params: BaseShopConstructorParams) {
    this._shopCreatorAddress = params.shopCreatorAddress;
    this._treasuryMint = params.treasuryMint;
    this._env = params.env;
    this._programId = params.programId;
    this._settings = params.settings;
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);
  }

  // Only inheritors can call this configuration
  protected static configEndpoint(env: Blockchain) {
    configBaseUrl(getBaseUrl(env));
  }

  // Properties
  abstract get candyShopAddress(): string;
  abstract get version(): CandyShopVersion;

  // Marketplace
  abstract buy(params: any): Promise<string>;
  abstract sell(params: any): Promise<string>;
  abstract cancel(params: any): Promise<string>;
}
