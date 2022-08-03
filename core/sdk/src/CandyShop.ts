import {
  CandyShop as CandyShopResponse,
  ListBase,
  Nft,
  Order,
  OrdersFilterQuery,
  ShopStats,
  SingleBase,
  Trade,
  TradeQuery,
  WhitelistNft
} from '@liqnft/candy-shop-types';
import { Idl, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShopCommitNftParams, CandyShopMintPrintParams } from '.';
import { CandyShopDrop } from './CandyShopDrop';
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
  CandyShopBuyNowParams,
  CandyShopBuyParams,
  CandyShopCancelAuctionParams,
  CandyShopCancelParams,
  CandyShopConstructorParams,
  CandyShopCreateAuctionParams,
  CandyShopRedeemParams,
  CandyShopSellParams,
  CandyShopSettings,
  CandyShopSettleAndDistributeParams,
  CandyShopUpdateParams,
  CandyShopVersion,
  CandyShopWithdrawAuctionBidParams
} from './CandyShopModel';
import { CandyShopTrade } from './CandyShopTrade';
import { CANDY_SHOP_PROGRAM_ID, CANDY_SHOP_V2_PROGRAM_ID } from './factory/constants';
import {
  bidAuction,
  BidAuctionParams,
  bidAuctionV1,
  buyNowAuction,
  BuyNowAuctionParams,
  buyNowAuctionV1,
  cancelAuction,
  CancelAuctionParams,
  cancelAuctionV1,
  createAuction,
  CreateAuctionParams,
  createAuctionV1,
  SettleAndDistributeProceedParams,
  settleAndDistributeProceeds,
  settleAndDistributeProceedsV1,
  updateCandyShop,
  UpdateCandyShopParams,
  updateCandyShopV1,
  withdrawBid,
  WithdrawBidParams,
  withdrawBidV1
} from './factory/program';
import {
  CandyShopError,
  CandyShopErrorType,
  getAuction,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getCandyShopVersion,
  getMetadataAccount,
  getProgram
} from './vendor';
import { configBaseUrl } from './vendor/config';
import { supply } from './vendor/shipping';

const Logger = 'CandyShop';

const DEFAULT_CURRENCY_SYMBOL = 'SOL';
const DEFAULT_CURRENCY_DECIMALS = 9;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = 'https://ssc-dao.genesysgo.net/';

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
  private _isEnterprise: boolean;
  private _version: CandyShopVersion;
  private _program: Program | undefined;

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

  get isEnterprise(): boolean {
    return this._isEnterprise;
  }

  get version(): CandyShopVersion {
    return this._version;
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
   * Instantiate a CandyShop object
   *
   * @constructor
   * @param {CandyShopConstructorParams} params
   */
  // Changed constructor params to object, can revert if it will cause too many issues
  constructor(params: CandyShopConstructorParams) {
    const { candyShopCreatorAddress, candyShopProgramId, treasuryMint, env, settings, isEnterprise } = params;

    this.verifyProgramId(candyShopProgramId);

    if (isEnterprise && !candyShopProgramId.equals(CANDY_SHOP_V2_PROGRAM_ID)) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    this._candyShopAddress = getCandyShopSync(candyShopCreatorAddress, treasuryMint, candyShopProgramId)[0];
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._programId = candyShopProgramId;
    this._env = env ?? 'devnet';
    this._isEnterprise = isEnterprise ? true : false;
    this._version = getCandyShopVersion(candyShopProgramId);
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

  verifyProgramId(programId: web3.PublicKey) {
    switch (programId.toString()) {
      case CANDY_SHOP_PROGRAM_ID.toString():
        break;
      case CANDY_SHOP_V2_PROGRAM_ID.toString():
        break;
      default:
        throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }
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
  getStaticProgram(wallet: AnchorWallet | web3.Keypair): Program<Idl> {
    if (this._program) return this._program;
    return getProgram(this.connection(), this._programId, wallet);
  }

  /**
   * Executes Candy Shop __UpdateCandyShop__ action
   *
   * @param {CandyShopUpdateParams} params required parameters for update action
   */
  public async updateCandyShop(params: CandyShopUpdateParams): Promise<string> {
    const { wallet, sellerFeeBasisPoint, requiresSignOff, canChangeSalePrice, split } = params;

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

    const updateCandyShopParams: UpdateCandyShopParams = {
      wallet,
      treasuryMint: this._treasuryMint,
      sellerFeeBasisPoint,
      requiresSignOff,
      canChangeSalePrice,
      split,
      auctionHouse,
      auctionHouseAuthority,
      authorityBump,
      program: this.getStaticProgram(wallet)
    };

    const txHash = await supply(updateCandyShopParams, this._version, updateCandyShopV1, updateCandyShop);

    return txHash;
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
    const txHash = await CandyShopTrade.buy({
      connection: this.connection(),
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      shopCreatorAddress: this._candyShopCreatorAddress,
      shopTreasuryMint: this._treasuryMint,
      isEnterprise: this._isEnterprise,
      wallet: wallet,
      tokenAccount: tokenAccount,
      tokenMint: tokenMint,
      seller: seller,
      price: price
    });
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
    const txHash = await CandyShopTrade.sell({
      connection: this.connection(),
      tokenAccount: tokenAccount,
      tokenMint: tokenMint,
      price: price,
      wallet: wallet,
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      shopTreasuryMint: this._treasuryMint,
      shopCreatorAddress: this._candyShopCreatorAddress
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
    const txHash = await CandyShopTrade.cancel({
      connection: this.connection(),
      tokenAccount: tokenAccount,
      tokenMint: tokenMint,
      price: price,
      wallet: wallet,
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      shopTreasuryMint: this._treasuryMint,
      shopCreatorAddress: this._candyShopCreatorAddress
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

    const createAuctionParams: CreateAuctionParams = {
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
    };

    const txHash = await supply(createAuctionParams, this._version, createAuctionV1, createAuction);

    return txHash;
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

    const cancelAuctionParams: CancelAuctionParams = {
      seller: wallet,
      auction,
      authority: auctionHouseAuthority,
      auctionBump,
      candyShop: this._candyShopAddress,
      treasuryMint: this._treasuryMint,
      nftMint: tokenMint,
      program
    };

    const txHash = await supply(cancelAuctionParams, this._version, cancelAuctionV1, cancelAuction);

    return txHash;
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

    const bidParams: BidAuctionParams = {
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
    };

    const txHash = await supply(bidParams, this._version, bidAuctionV1, bidAuction);

    return txHash;
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

    const withdrawBidParams: WithdrawBidParams = {
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
    };

    const txHash = await supply(withdrawBidParams, this._version, withdrawBidV1, withdrawBid);

    return txHash;
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

    const buyNowParams: BuyNowAuctionParams = {
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
    };

    const txHash = await supply(buyNowParams, this._version, buyNowAuctionV1, buyNowAuction);

    return txHash;
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

    const settleAndDistributeParams: SettleAndDistributeProceedParams = {
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
    };

    const txHash = await supply(
      settleAndDistributeParams,
      this._version,
      settleAndDistributeProceedsV1,
      settleAndDistributeProceeds
    );

    return txHash;
  }

  /**
   * Executes Edition Drop __ShopCommitNft__ or __EnterpriseCommitNft__ action
   * ref: https://docs.metaplex.com/terminology#master-edition
   *
   * @param {CandyShopCommitNftParams} params required parameters for commit nft action
   */
  public async commitMasterNft(params: CandyShopCommitNftParams) {
    const { nftOwnerTokenAccount, masterMint, whitelistMint, nftOwner, price, startTime, salesPeriod, whitelistTime } =
      params;

    if (this._version !== CandyShopVersion.V2) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    console.log(`${Logger}: performing commit nft `, {
      nftMint: masterMint.toString()
    });

    const txHash = await CandyShopDrop.commitNft({
      candyShop: this._candyShopAddress,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      nftOwner,
      price,
      startTime,
      salesPeriod,
      whitelistTime,
      isEnterprise: this._isEnterprise,
      connection: this.connection(),
      candyShopProgram: this.getStaticProgram(nftOwner)
    });

    return txHash;
  }

  /**
   * Executes Edition Drop __ShopMintPrint__ or __EnterpriseMintPrint__ action
   *
   * @param {CandyShopMintPrintParams} params required parameters for mint print action
   */
  public async mintNewPrint(params: CandyShopMintPrintParams) {
    const { nftOwnerTokenAccount, masterMint, whitelistMint, editionBuyer } = params;

    if (this._version !== CandyShopVersion.V2) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    console.log(`${Logger}: performing mint print `, {
      masterNft: masterMint.toString(),
      nftOwner: nftOwnerTokenAccount.toString(),
      editionBuyer: editionBuyer.publicKey.toString(),
      whitelistMint: whitelistMint ? whitelistMint.toString() : undefined
    });

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._treasuryMint,
      this.programId
    );
    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);
    const txHash = await CandyShopDrop.mintPrint({
      candyShop: this._candyShopAddress,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      isEnterprise: this._isEnterprise,
      connection: this.connection(),
      candyShopProgram: this.getStaticProgram(editionBuyer)
    });

    return txHash;
  }

  /**
   * Executes Edition Drop __RedeemNft__ action
   *
   * @param {CandyShopRedeemParams} params required parameters for mint print action
   */
  public async redeemDrop(params: CandyShopRedeemParams) {
    const { nftOwnerTokenAccount, masterMint, nftOwner } = params;

    if (this._version !== CandyShopVersion.V2) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    console.log(`${Logger}: performing redeem drop `, {
      masterNft: masterMint.toString()
    });

    const txHash = await CandyShopDrop.redeemDrop({
      nftOwner,
      candyShop: this._candyShopAddress,
      nftOwnerTokenAccount,
      masterMint,
      isEnterprise: this._isEnterprise,
      connection: this.connection(),
      candyShopProgram: this.getStaticProgram(nftOwner)
    });

    return txHash;
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
