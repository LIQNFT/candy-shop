import { BN, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import axiosInstance, { configBaseUrl } from './config';

import {
  ListBase,
  Nft,
  Order,
  ShopStats,
  SingleBase,
  Trade,
  WhitelistNft,
  CandyShop as CandyShopResponse
} from 'solana-candy-shop-schema/dist';

import { fetchNftByMint } from './api/backend/NftAPI';
import {
  fetchShopWhitelistNftByShopId,
  fetchShopByShopId
} from './api/backend/ShopAPI';
import {
  fetchOrderByTokenMintAndShopId,
  fetchOrdersByStoreId,
  fetchOrdersByStoreIdAndWalletAddress,
  OrdersFilterQuery
} from './api/backend/OrderAPI';
import { fetchShopByWalletAddress } from './api/backend/ShopAPI';
import { fetchStatsById } from './api/backend/StatsAPI';
import { fetchTradeById } from './api/backend/TradeAPI';

import { buyAndExecuteSale } from './api/program/buyAndExecuteSale';
import { cancelOrder } from './api/program/cancel';
import { sellNft } from './api/program/sell';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getMetadataAccount
} from './api/utils';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const DEFAULT_CURRENCY_SYMBOL = 'SOL';
const DEFAULT_CURRENCY_DECIMALS = 9;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_VOLUME_DECIMALS = 1;

/**
 * @field currencySymbol your shop transaction currency symbol (default is SOL)
 * @field currencyDecimals your shop transaction currency decimals (default is 9 for SOL)
 * @field priceDecimals number of decimals to display for price numbers (default is 3)
 * @field volumeDecimals number of decimals to display for volume numbers (default is 1)
 */
export type CandyShopSettings = {
  currencySymbol: string;
  currencyDecimals: number;
  priceDecimals: number;
  volumeDecimals: number;
};

/**
 * @class CandyShop
 */
export class CandyShop {
  private _candyShopAddress: web3.PublicKey;
  private _candyShopCreatorAddress: web3.PublicKey;
  private _treasuryMint: web3.PublicKey;
  private _programId: web3.PublicKey;
  private _env: web3.Cluster;
  private _settings: CandyShopSettings;
  private _baseUnitsPerCurrency: number;
  private _program: Program | undefined;

  /**
   * @constructor
   * @param candyShopCreatorAddress creator address (i.e. your wallet address)
   * @param treasuryMint treasury mint (i.e. currency to buy and sell with)
   * @param candyShopProgramId Candy Shop program id
   * @param env web3.Cluster mainnet, devnet
   * @param settings optional, additional shop settings
   */
  constructor(
    candyShopCreatorAddress: web3.PublicKey,
    treasuryMint: web3.PublicKey,
    candyShopProgramId: web3.PublicKey,
    env: web3.Cluster,
    settings?: CandyShopSettings
  ) {
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
      volumeDecimals: settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS
    };
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);

    configBaseUrl(env);
  }
  /**
   * Initiate the CandyShop object
   */
  async getStaticProgram(wallet: AnchorWallet | web3.Keypair): Promise<any> {
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
    const provider = new Provider(
      connection,
      // check the instance type
      'signTransaction' in wallet ? wallet : new NodeWallet(wallet),
      options
    );
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

  public async connection(): Promise<web3.Connection> {
    const options = Provider.defaultOptions();
    const connection = new web3.Connection(
      this._env === 'mainnet-beta'
        ? 'https://ssc-dao.genesysgo.net/'
        : web3.clusterApiUrl('devnet'),
      options.commitment
    );
    return connection;
  }

  public async buy(
    seller: web3.PublicKey,
    tokenAccount: web3.PublicKey,
    tokenMint: web3.PublicKey,
    price: BN,
    wallet: AnchorWallet | web3.Keypair
  ): Promise<string> {
    console.log('CandyShop: performing buy', {
      seller: seller.toString(),
      tokenAccount: tokenAccount.toString(),
      tokenMint: tokenMint.toString(),
      price
    });
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
    wallet: AnchorWallet | web3.Keypair
  ): Promise<string> {
    console.log('CandyShop: performing sell', {
      tokenMint: tokenMint.toString(),
      tokenAccount: tokenAccount.toString(),
      price
    });
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
    wallet: AnchorWallet | web3.Keypair
  ): Promise<string> {
    console.log('CandyShop: performing cancel', {
      tokenAccount: tokenAccount.toString(),
      tokenMint: tokenMint.toString(),
      price
    });
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
    console.log('CandyShop: performing stats');
    return fetchStatsById(axiosInstance, this._candyShopAddress.toString());
  }

  public async transactions(): Promise<Trade[]> {
    return fetchTradeById(axiosInstance, this._candyShopAddress.toString());
  }

  public async nftInfo(mint: string): Promise<Nft> {
    console.log('CandyShop: performing nftInfo', { mint });
    return fetchNftByMint(axiosInstance, mint);
  }

  async orders(
    ordersFilterQuery: OrdersFilterQuery,
    identifiers?: number[]
  ): Promise<ListBase<Order>> {
    console.log('CandyShop: performing orders', {
      identifiers,
      ordersFilterQuery
    });
    const { sortBy, offset, limit } = ordersFilterQuery;
    return fetchOrdersByStoreId(
      axiosInstance,
      this._candyShopAddress.toString(),
      {
        sortBy,
        offset,
        limit
      },
      identifiers
    );
  }

  public async activeOrdersByWalletAddress(
    walletAddress: string
  ): Promise<Order[]> {
    console.log('CandyShop: performing activeOrdersByWalletAddress', {
      walletAddress
    });
    return fetchOrdersByStoreIdAndWalletAddress(
      axiosInstance,
      this._candyShopAddress.toString(),
      walletAddress
    );
  }

  public async shopWlNfts(): Promise<ListBase<WhitelistNft>> {
    console.log('CandyShop: performing shopWlNfts');
    return fetchShopWhitelistNftByShopId(
      axiosInstance,
      this._candyShopAddress.toString()
    );
  }

  public async activeOrderByMintAddress(
    mintAddress: string
  ): Promise<SingleBase<Order>> {
    console.log('CandyShop: performing activeOrderByMintAddress', {
      mintAddress
    });
    return fetchOrderByTokenMintAndShopId(
      axiosInstance,
      mintAddress,
      this._candyShopAddress.toString()
    );
  }

  public async fetchShopByWalletAddress(): Promise<
    ListBase<CandyShopResponse>
  > {
    return fetchShopByWalletAddress(
      axiosInstance,
      this._candyShopCreatorAddress.toString()
    );
  }

  public async fetchShopByShopId(): Promise<SingleBase<CandyShopResponse>> {
    return fetchShopByShopId(axiosInstance, this._candyShopAddress.toString());
  }
}
