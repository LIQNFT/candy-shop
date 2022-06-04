import {
  CandyShop as CandyShopResponse,
  ListBase,
  Nft,
  Order,
  ShopStats,
  SingleBase,
  Trade,
  WhitelistNft
} from '@liqnft/candy-shop-types';
import { BN, Idl, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  buyAndExecuteSale,
  BuyAndExecuteSaleTransactionParams,
  cancelAuction,
  CancelAuctionParams,
  cancelOrder,
  createAuction,
  CreateAuctionParams,
  getAuction,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getMetadataAccount,
  insBuyAndExecuteSale,
  sellNft,
  bidAuction,
  BidAuctionParams,
  withdrawBid,
  WithdrawBidParams,
  settleAndDistributeProceeds,
  SettleAndDistributeProceedParams,
  buyNowAuction,
  BuyNowAuctionParams
} from './api';
import candyShopIdl from './candy_shop.json';
import { OrdersFilterQuery, TradeQuery } from './api/backend';
import { CANDY_SHOP_INS_PROGRAM_ID, CANDY_SHOP_PROGRAM_ID } from './api/constants';
import {
  fetchNFTByMintAddress,
  fetchOrderByShopAndMintAddress,
  fetchOrdersByShopAddress,
  fetchOrdersByShopAndWalletAddress,
  fetchShopByShopAddress,
  fetchShopWhitelistNftByShopAddress,
  fetchStatsByShopAddress,
  fetchTradeByShopAddress
} from './CandyShopInfoAPI';
import {
  CandyShopBidAuctionParams,
  CandyShopBuyParams,
  CandyShopCancelAuctionParams,
  CandyShopCancelParams,
  CandyShopCreateAuctionParams,
  CandyShopSellParams,
  CandyShopSettings,
  CandyShopWithdrawAuctionBidParams,
  CandyShopSettleAndDistributeParams,
  CandyShopBuyNowParams,
  CandyShopUpdateParams
} from './CandyShopModel';
import { configBaseUrl } from './config';
import { CandyShopError, CandyShopErrorType } from './utils';
import { updateCandyShop } from './api/program/marketplace/updateCandyShop';

const Logger = 'CandyShop';

const DEFAULT_CURRENCY_SYMBOL = 'SOL';
const DEFAULT_CURRENCY_DECIMALS = 9;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = 'https://ssc-dao.genesysgo.net/';
let staticNodeWallet: any = null;

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
   * Initiate the CandyShop object
   *
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
    settings?: Partial<CandyShopSettings>
  ) {
    this._candyShopAddress = getCandyShopSync(candyShopCreatorAddress, treasuryMint, candyShopProgramId)[0];
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._programId = candyShopProgramId;
    this._env = env;
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
    console.log('CandyShop constructor: init CandyShop=', this);
    configBaseUrl(env);
  }
  /**
   * Get JSON rpc connection
   */
  public connection(): web3.Connection {
    const options = Provider.defaultOptions();
    if (this._env === 'devnet') {
      return new web3.Connection(web3.clusterApiUrl('devnet'));
    }

    return new web3.Connection(
      this._settings.mainnetConnectionUrl,
      this._settings.connectionConfig || options.commitment
    );
  }

  /**
   * Gets anchor Program object for Candy Shop program
   *
   * @param {AnchorWallet | web3.Keypair} wallet Wallet or keypair of connected user
   */
  async getStaticProgram(wallet: AnchorWallet | web3.Keypair): Promise<Program<Idl>> {
    if (this._program) return this._program;

    const options = Provider.defaultOptions();
    const connection = this.connection();
    const provider = new Provider(
      connection,
      // check the instance type
      wallet instanceof web3.Keypair ? getNodeWallet(wallet) : wallet,
      options
    );
    console.log(`${Logger}: fetching idl for programId`, this._programId.toString());

    // Directly use the JSON file here temporarily
    if (this.programId.equals(CANDY_SHOP_PROGRAM_ID)) {
      // @ts-ignore
      this._program = new Program(candyShopIdl, this._programId, provider);
    } else {
      // TODO: remove when CandyShop V2 is deployed
      const idl = await Program.fetchIdl(this._programId, provider);
      if (idl) {
        this._program = new Program(idl, this._programId, provider);
        return this._program;
      } else {
        throw new Error('Idl not found');
      }
    }
    return this._program;
  }

  get currencyDecimals(): number {
    return this._settings.currencyDecimals;
  }

  get settings(): Partial<CandyShopSettings> {
    return this._settings;
  }

  get env(): web3.Cluster {
    return this._env;
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
   * Executes Candy Shop __UpdateCandyShop__ action
   *
   * @param {CandyShopUpdateParams} params required parameters for update action
   */
  public async updateCandyShop(params: CandyShopUpdateParams): Promise<string> {
    const { wallet, sellerFeeBasisPoint, requiresSignOff, canChangeSalePrice, split } = params;

    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    console.log(`${Logger}: performing update, `, {
      auctionHouse: auctionHouse.toString(),
      sellerFeeBasisPoint: sellerFeeBasisPoint ? sellerFeeBasisPoint.toString() : null
    });

    const tx = await updateCandyShop({
      wallet,
      treasuryMint: this._treasuryMint,
      sellerFeeBasisPoint,
      requiresSignOff,
      canChangeSalePrice,
      split,
      auctionHouse,
      auctionHouseAuthority,
      authorityBump,
      program
    });

    return tx.txId;
  }

  /**
   * Executes Candy Shop __Buy__ and __ExecuteSale__ actions
   *
   * @param {CandyShopBuyParams} params required parameters for buy action
   */
  public async buy(params: CandyShopBuyParams): Promise<string> {
    const { seller, tokenAccount, tokenMint, price, wallet } = params;

    console.log(`${Logger}: performing buy, `, {
      seller: seller.toString(),
      tokenAccount: tokenAccount.toString(),
      tokenMint: tokenMint.toString(),
      price
    });
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);
    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const buyTxHashParams: BuyAndExecuteSaleTransactionParams = {
      wallet,
      counterParty: seller,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: this._treasuryMint,
      auctionHouseTreasury: treasuryAccount,
      metadata,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop: this._candyShopAddress,
      price,
      amount: new BN(1),
      program
    };
    const txHash = await buyAndExecuteSales(this._programId, buyTxHashParams);

    return txHash;
  }
  /**
   * Executes Candy Shop __Sell__ action
   *
   * @param {CandyShopSellParams} params required parameters for sell action
   */
  public async sell(params: CandyShopSellParams): Promise<string> {
    const { tokenAccount, tokenMint, price, wallet } = params;

    console.log(`${Logger}: Performing sell `, {
      tokenMint: tokenMint.toString(),
      tokenAccount: tokenAccount.toString(),
      price
    });
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const txHash = await sellNft({
      wallet,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: this._treasuryMint,
      metadata,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop: this._candyShopAddress,
      price,
      amount: new BN(1),
      program
    });
    return txHash;
  }
  /**
   * Executes Candy Shop __Cancel__ action
   *
   * @param {CandyShopCancelParams} params required parameters for cancel action
   */
  async cancel(params: CandyShopCancelParams): Promise<string> {
    const { tokenAccount, tokenMint, price, wallet } = params;

    console.log('CandyShop: performing cancel', {
      tokenAccount: tokenAccount.toString(),
      tokenMint: tokenMint.toString(),
      price
    });
    const program = await this.getStaticProgram(wallet);
    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

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

    const txHash = await cancelOrder({
      wallet,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: this._treasuryMint,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      tradeState,
      candyShop: this._candyShopAddress,
      price,
      amount: new BN(1),
      program
    });

    return txHash;
  }
  /**
   * Executes Candy Shop __CreateAuction__ action
   *
   * @param {CandyShopCreateAuctionParams} params required parameters for create auction action
   */
  public async createAuction(params: CandyShopCreateAuctionParams): Promise<string> {
    const { tokenAccount, tokenMint, startingBid, startTime, biddingPeriod, buyNowPrice, wallet, tickSize } = params;

    if (wallet.publicKey.toString() !== this.candyShopCreatorAddress.toString()) {
      throw new CandyShopError(CandyShopErrorType.NonShopOwner);
    }

    console.log(`${Logger}: Performing create auction`, {
      tokenMint: tokenMint.toString(),
      tokenAccount: tokenAccount.toString(),
      startingBid: startingBid.toString(),
      startTime: startTime.toString(),
      biddingPeriod: biddingPeriod.toString(),
      buyNowPrice
    });
    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (auctionAccount?.data) {
      throw new Error(CandyShopErrorType.AuctionExists);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const tx = await createAuction({
      seller: wallet,
      auction,
      authority: auctionHouseAuthority,
      auctionBump,
      candyShop: this._candyShopAddress,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      startingBid,
      startTime,
      biddingPeriod,
      tickSize,
      buyNowPrice,
      program
    } as CreateAuctionParams);
    return tx.txId;
  }

  /**
   * Executes Candy Shop __CancelAuction__ action
   *
   * @param {CandyShopCancelAuctionParams} params required parameters for cancel auction action
   */
  public async cancelAuction(params: CandyShopCancelAuctionParams): Promise<string> {
    const { tokenAccount, tokenMint, wallet } = params;

    if (wallet.publicKey.toString() !== this.candyShopCreatorAddress.toString()) {
      throw new CandyShopError(CandyShopErrorType.NonShopOwner);
    }

    console.log(`${Logger}: Performing cancel auction `, {
      tokenMint: tokenMint.toString(),
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const tx = await cancelAuction({
      seller: wallet,
      auction,
      authority: auctionHouseAuthority,
      auctionBump,
      candyShop: this._candyShopAddress,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      program
    } as CancelAuctionParams);
    return tx.txId;
  }

  /**
   * Executes Candy Shop __MakeBid__ action
   *
   * @param {BidAuctionParams} params required parameters for make bid action
   */
  public async bidAuction(params: CandyShopBidAuctionParams): Promise<string> {
    const { tokenAccount, tokenMint, wallet, bidPrice } = params;

    console.log(`${Logger}: performing bid auction, `, {
      bidPrice: bidPrice.toString(),
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const tx = await bidAuction({
      auction,
      authority: auctionHouseAuthority,
      candyShop: this._candyShopAddress,
      buyer: wallet,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      bidPrice,
      program
    } as BidAuctionParams);
    return tx.txId;
  }

  /**
   * Executes Candy Shop __WithdrawBid__ action
   *
   * @param {CandyShopWithdrawAuctionBidParams} params required parameters for withdraw bid action
   */
  public async withdrawAuctionBid(params: CandyShopWithdrawAuctionBidParams): Promise<string> {
    const { tokenAccount, tokenMint, wallet } = params;

    console.log(`${Logger}: Performing withdraw bid auction `, {
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const tx = await withdrawBid({
      auction,
      authority: auctionHouseAuthority,
      candyShop: this._candyShopAddress,
      buyer: wallet,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      program
    } as WithdrawBidParams);
    return tx.txId;
  }

  /**
   * Executes Candy Shop __BuyNow__ action
   *
   * @param {CandyShopBuyNowParams} params required parameters for buy now action
   */
  public async buyNowAuction(params: CandyShopBuyNowParams): Promise<string> {
    const { tokenAccount, tokenMint, wallet } = params;

    console.log(`${Logger}: performing buy now auction `, {
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const tx = await buyNowAuction({
      auction,
      auctionBump,
      authority: auctionHouseAuthority,
      candyShop: this._candyShopAddress,
      buyer: wallet,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      treasuryAccount,
      program,
      env: this._env
    } as BuyNowAuctionParams);
    return tx.txId;
  }

  /**
   * Executes Candy Shop __SettleAuction__ and __DistributeProceeds__ actions
   *
   * @param {CandyShopSettleAndDistributeParams} params required parameters for settle auction and distribute proceed actions
   */
  public async settleAndDistributeAuctionProceeds(params: CandyShopSettleAndDistributeParams): Promise<string> {
    const { tokenAccount, tokenMint, wallet } = params;

    console.log(`${Logger}: performing settle auction and distribute proceeds `, {
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, this._programId);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this._programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const tx = await settleAndDistributeProceeds({
      auction,
      auctionBump,
      authority: auctionHouseAuthority,
      candyShop: this._candyShopAddress,
      settler: wallet,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      treasuryAccount,
      program,
      env: this._env
    } as SettleAndDistributeProceedParams);
    return tx.txId;
  }

  /**
   * Fetch stats associated with this Candy Shop
   */
  public stats(): Promise<ShopStats> {
    return fetchStatsByShopAddress(this._candyShopAddress);
  }
  /**
   * Fetch transactions made through this Candy Shop
   *
   * * @param {number[]} identifiers optional list of identifiers to apply to query string
   */
  public transactions(queryDto: TradeQuery): Promise<ListBase<Trade>> {
    return fetchTradeByShopAddress(this._candyShopAddress, queryDto);
  }
  /**
   * Fetch information on the specified nft
   *
   * @param {string} mint base 58 encoded mint key string
   */
  public nftInfo(mint: string): Promise<Nft> {
    return fetchNFTByMintAddress(mint);
  }
  /**
   * Fetch orders matching specified filters
   *
   * @param {OrdersFilterQuery} ordersFilterQuery filters to apply to search
   */
  public orders(ordersFilterQuery: OrdersFilterQuery): Promise<ListBase<Order>> {
    return fetchOrdersByShopAddress(this._candyShopAddress, ordersFilterQuery);
  }
  /**
   * Fetch active orders created by specified wallet address
   *
   * @param {string} walletAddress base 58 encoded public key string
   */
  public activeOrdersByWalletAddress(walletAddress: string): Promise<Order[]> {
    return fetchOrdersByShopAndWalletAddress(this._candyShopAddress, walletAddress);
  }
  /**
   * Fetch list of whitelisted NFTs for this Candy Shop
   */
  public shopWlNfts(): Promise<ListBase<WhitelistNft>> {
    return fetchShopWhitelistNftByShopAddress(this._candyShopAddress);
  }
  /**
   * Fetch active orders associated with specified mint address
   *
   * @param {string} mintAddress base 58 encoded mint key string
   */
  public activeOrderByMintAddress(mintAddress: string): Promise<SingleBase<Order>> {
    return fetchOrderByShopAndMintAddress(this._candyShopAddress, mintAddress);
  }
  /**
   * Fetch the data for Candy Shop with this Shop's public key
   */
  public fetchShopByShopId(): Promise<SingleBase<CandyShopResponse>> {
    return fetchShopByShopAddress(this._candyShopAddress);
  }
}

/**
 * Get NodeWallet from specified keypair
 *
 * @param {Keypair} wallet keypair wallet will be created for
 * @returns
 */
function getNodeWallet(wallet: web3.Keypair) {
  if (!staticNodeWallet) {
    const NodeWallet = require('@project-serum/anchor/dist/cjs/nodewallet').default;
    staticNodeWallet = new NodeWallet(wallet);
  }
  return staticNodeWallet;
}

/**
 * Get tx hash from different executions by programId
 *
 * @param {PublicKey} programId
 * @param {BuyAndExecuteSaleTransactionParams} params required params for buy/sell transaction
 * @returns
 */
function buyAndExecuteSales(programId: web3.PublicKey, params: BuyAndExecuteSaleTransactionParams): Promise<string> {
  if (programId.equals(CANDY_SHOP_INS_PROGRAM_ID)) {
    return insBuyAndExecuteSale(params);
  }
  return buyAndExecuteSale(params);
}
