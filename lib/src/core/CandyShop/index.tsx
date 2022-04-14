import { BN, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { fetchNftByMint } from 'api/backend/NftAPI';
import { fetchShopWhitelistNftByShopId } from 'api/backend/ShopAPI';
import { configBaseUrl } from 'config/axiosInstance';
import {
  ListBase,
  Nft,
  Order,
  ShopStats,
  SingleBase,
  Trade,
  WhitelistNft,
} from 'solana-candy-shop-schema/dist';
import {
  fetchOrderByTokenMint,
  fetchOrdersByStoreId,
  fetchOrdersByStoreIdAndWalletAddress,
  OrdersFilterQuery,
} from 'api/backend/OrderAPI';
import { fetchStatsById } from 'api/backend/StatsAPI';
import { fetchTradeById } from 'api/backend/TradeAPI';
import { buyAndExecuteSale } from 'api/program/buyAndExecuteSale';
import { cancelOrder } from 'api/program/cancel';
import { sellNft } from 'api/program/sell';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getMetadataAccount,
} from 'api/utils';

const DEFAULT_CURRENCY_SYMBOL = 'SOL';
const DEFAULT_CURRENCY_DECIMALS = 9;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_VOLUME_DECIMALS = 1;

export type Settings = {
  currencySymbol: string;
  currencyDecimals: number;
  priceDecimals: number;
  volumeDecimals: number;
};

/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _candyShopAddress: web3.PublicKey;
  private _candyShopCreatorAddress: web3.PublicKey;
  private _treasuryMint: web3.PublicKey;
  private _programId: web3.PublicKey;
  private _env: web3.Cluster;
  private _settings: Settings;
  private _baseUnitsPerCurrency: number;
  private _program: Program | undefined;

  constructor(
    candyShopCreatorAddress: web3.PublicKey,
    treasuryMint: web3.PublicKey,
    candyShopProgramId: web3.PublicKey,
    env: web3.Cluster,
    settings?: {
      currencySymbol?: string;
      currencyDecimals?: number;
      priceDecimals?: number;
      volumeDecimals?: number;
    }
  ) {
    settings = settings ?? {};

    this._candyShopAddress = getCandyShopSync(
      candyShopCreatorAddress,
      treasuryMint,
      candyShopProgramId
    )[0];
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._programId = candyShopProgramId;
    this._env = env;
    this._settings = {
      currencySymbol: settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
      currencyDecimals: settings?.currencyDecimals ?? DEFAULT_CURRENCY_DECIMALS,
      priceDecimals: settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      volumeDecimals: settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
    };
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);

    configBaseUrl(env);
  }
  /**
   * Initiate the CandyShop object
   */
  async getStaticProgram(wallet: AnchorWallet): Promise<any> {
    if (this._program) {
      return this._program;
    }

    const options = Provider.defaultOptions();
    const connection = new web3.Connection(
      this._env === 'mainnet-beta'
        ? 'https://ssc-dao.genesysgo.net/'
        : web3.clusterApiUrl('devnet'),
      options.commitment
    );
    const provider = new Provider(connection, wallet, options);
    console.log(
      'CandyShop init: fetching idl for programId',
      this._programId.toString()
    );

    const idl = await Program.fetchIdl(this._programId, provider);
    if (idl) {
      this._program = new Program(idl, this._programId, provider);
      return this._program;
    } else {
      throw new Error('Idl not found');
    }
  }

  get treasuryMint(): web3.PublicKey {
    return this._treasuryMint;
  }

  get connectedPublicKey(): web3.PublicKey | undefined {
    return this._program?.provider.wallet.publicKey;
  }

  get candyShopAddress(): web3.PublicKey {
    return this._candyShopAddress;
  }

  get candyShopCreatorAddress(): web3.PublicKey {
    return this._candyShopCreatorAddress;
  }

  get programId(): web3.PublicKey {
    return this._programId;
  }

  get baseUnitsPerCurrency(): number {
    return this._baseUnitsPerCurrency;
  }

  get currencySymbol(): string {
    return this._settings.currencySymbol;
  }

  get priceDecimals(): number {
    return this._settings.priceDecimals;
  }

  get volumeDecimals(): number {
    return this._settings.volumeDecimals;
  }

  public async buy(
    seller: web3.PublicKey,
    tokenAccount: web3.PublicKey,
    tokenMint: web3.PublicKey,
    price: BN,
    wallet: AnchorWallet
  ): Promise<string> {
    console.log('buy called');
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        this._candyShopCreatorAddress,
        this._treasuryMint,
        this._programId
      );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      this._treasuryMint
    );
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);
    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const txHash = await buyAndExecuteSale(
      wallet,
      seller,
      tokenAccount,
      tokenMint,
      this._treasuryMint,
      treasuryAccount,
      metadata,
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      this._candyShopAddress,
      price,
      new BN(1),
      program
    );

    return txHash;
  }

  public async sell(
    tokenAccount: web3.PublicKey,
    tokenMint: web3.PublicKey,
    price: BN,
    wallet: AnchorWallet
  ): Promise<string> {
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        this._candyShopCreatorAddress,
        this._treasuryMint,
        this._programId
      );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      this._treasuryMint
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const txHash = await sellNft(
      wallet,
      tokenAccount,
      tokenMint,
      this._treasuryMint,
      metadata,
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      this._candyShopAddress,
      price,
      new BN(1),
      program
    );
    return txHash;
  }

  async cancel(
    tokenAccount: web3.PublicKey,
    tokenMint: web3.PublicKey,
    price: BN,
    wallet: AnchorWallet
  ): Promise<string> {
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        this._candyShopCreatorAddress,
        this._treasuryMint,
        this._programId
      );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      this._treasuryMint
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      wallet.publicKey,
      tokenAccount,
      this._treasuryMint,
      tokenMint,
      new BN(1),
      price
    );

    const txHash = await cancelOrder(
      wallet,
      tokenAccount,
      tokenMint,
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      tradeState,
      this._candyShopAddress,
      price,
      new BN(1),
      program
    );

    return txHash;
  }

  public async stats(): Promise<ShopStats> {
    return fetchStatsById(this._candyShopAddress.toString());
  }

  public async transactions(): Promise<Trade[]> {
    return fetchTradeById(this._candyShopAddress.toString());
  }

  public async nftInfo(mint: string): Promise<Nft> {
    return fetchNftByMint(mint);
  }

  async orders(
    ordersFilterQuery: OrdersFilterQuery,
    identifiers?: string[]
  ): Promise<ListBase<Order>> {
    const { sortBy, offset, limit } = ordersFilterQuery;
    return fetchOrdersByStoreId(
      this._candyShopAddress.toString(),
      {
        sortBy,
        offset,
        limit,
      },
      identifiers
    );
  }

  public async activeOrdersByWalletAddress(
    walletAddress: string
  ): Promise<Order[]> {
    return fetchOrdersByStoreIdAndWalletAddress(
      this._candyShopAddress.toString(),
      walletAddress
    );
  }

  public async shopWlNfts(): Promise<ListBase<WhitelistNft>> {
    return fetchShopWhitelistNftByShopId(this._candyShopAddress.toString());
  }

  public async activeOrderByMintAddress(
    mintAddress: string
  ): Promise<SingleBase<Order>> {
    return fetchOrderByTokenMint(mintAddress);
  }
}
