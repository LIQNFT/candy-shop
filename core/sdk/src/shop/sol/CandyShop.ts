import { BaseShop } from '../base/BaseShop';
import {
  CandyShop as CandyShopResponse,
  ListBase,
  Blockchain,
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
import { Idl, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShopCommitNftParams, CandyShopMintPrintParams } from './CandyShopModel';
import { CandyShopDrop, createNewMintInstructions } from '../../CandyShopDrop';
import {
  fetchNFTByMintAddress,
  fetchOrderByShopAndMintAddress,
  fetchOrdersByShopAddress,
  fetchOrdersByShopAndMasterEditionMint,
  fetchOrdersByShopAndWalletAddress,
  fetchShopByShopAddress,
  fetchShopWhitelistNftByShopAddress,
  fetchStatsByShopAddress,
  fetchTradeByShopAddress
} from '../../CandyShopInfoAPI';
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
  CandyShopSettleAndDistributeParams,
  CandyShopUpdateParams,
  CandyShopWithdrawAuctionBidParams
} from './CandyShopModel';
import { CandyShopTrade } from '../../CandyShopTrade';
import { CandyShopAuction } from '../../CandyShopAuction';
import { CANDY_SHOP_PROGRAM_ID, CANDY_SHOP_V2_PROGRAM_ID } from '../../factory/constants';
import {
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
  updateCandyShopV1
} from '../../factory/program';
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
} from '../../vendor';
import { configBaseUrl } from '../../vendor/config';
import { supply } from '../../vendor/shipping';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';

const Logger = 'CandyShop';

const DEFAULT_CURRENCY_SYMBOL = 'SOL';
const DEFAULT_CURRENCY_DECIMALS = 9;
const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;
const DEFAULT_MAINNET_CONNECTION_URL = 'https://api.mainnet-beta.solana.com';
const SOL_BACKEND_STAGING_URL = 'https://ckaho.liqnft.com/api';
const SOL_BACKEND_PROD_URL = 'https://candy.liqnft.com/api';

/**
 * @class CandyShop
 */
export class CandyShop extends BaseShop {
  private _candyShopAddress: web3.PublicKey;
  private _candyShopCreatorAddress: web3.PublicKey;
  private _treasuryMint: web3.PublicKey;
  private _programId: web3.PublicKey;
  private _env: Blockchain;
  private _settings: ShopSettings;
  private _baseUnitsPerCurrency: number;
  private _isEnterprise: boolean;
  private _version: CandyShopVersion;
  private _program: Program | undefined;

  get currencyDecimals(): number {
    return this._settings.currencyDecimals;
  }

  get settings(): Partial<ShopSettings> {
    return this._settings;
  }

  get env(): Blockchain {
    return this._env;
  }

  get treasuryMint(): string {
    return this._treasuryMint.toString();
  }

  get connectedPublicKey(): web3.PublicKey | undefined {
    return this._program?.provider.wallet.publicKey;
  }

  get candyShopCreatorAddress(): string {
    return this._candyShopCreatorAddress.toString();
  }

  get candyShopAddress(): string {
    return this._candyShopAddress.toString();
  }

  get programId(): string {
    return this._programId.toString();
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

  get explorerLink(): ExplorerLinkBase {
    return this._settings.explorerLink;
  }

  /**
   * Get JSON rpc connection
   */
  get connection(): web3.Connection {
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
   * Instantiate a CandyShop object
   *
   * @constructor
   * @param {CandyShopConstructorParams} params
   */

  constructor(params: CandyShopConstructorParams) {
    super(params);
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
      connectionConfig: settings?.connectionConfig,
      explorerLink: settings?.explorerLink ?? ExplorerLinkBase.SolanaFM
    };
    this._baseUnitsPerCurrency = Math.pow(10, this._settings.currencyDecimals);
    console.log('CandyShop constructor: init CandyShop=', this);
    const url = this._env === Blockchain.SolMainnetBeta ? SOL_BACKEND_PROD_URL : SOL_BACKEND_STAGING_URL;

    configBaseUrl(url);
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
   * Gets anchor Program object for Candy Shop program
   *
   * @param {AnchorWallet | web3.Keypair} wallet Wallet or keypair of connected user
   */
  getStaticProgram(wallet: AnchorWallet | web3.Keypair): Program<Idl> {
    if (this._program) return this._program;
    return getProgram(this.connection, this._programId, wallet);
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
      connection: this.connection,
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
      connection: this.connection,
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
      connection: this.connection,
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
    const {
      tokenAccount,
      tokenMint,
      startingBid,
      startTime,
      biddingPeriod,
      buyNowPrice,
      wallet,
      tickSize,
      extensionPeriod,
      extensionIncrement
    } = params;
    if (wallet.publicKey.toString() !== this.candyShopCreatorAddress.toString()) {
      throw new CandyShopError(CandyShopErrorType.NonShopOwner);
    }

    if (biddingPeriod.isZero()) {
      throw new CandyShopError(CandyShopErrorType.InvalidAuctionBiddingPeriod);
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
      extensionPeriod,
      extensionIncrement,
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

    const txHash = await CandyShopAuction.bid({
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      connection: this.connection,
      shopCreatorAddress: this._candyShopCreatorAddress,
      shopTreasuryMint: this._treasuryMint,
      version: this._version,
      tokenAccount,
      tokenMint,
      wallet,
      bidPrice
    });

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

    const txHash = await CandyShopAuction.withdrawBid({
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      connection: this.connection,
      shopCreatorAddress: this._candyShopCreatorAddress,
      shopTreasuryMint: this._treasuryMint,
      version: this._version,
      tokenAccount,
      tokenMint,
      wallet
    });

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

    const txHash = await CandyShopAuction.buyNow({
      shopAddress: this._candyShopAddress,
      candyShopProgramId: this._programId,
      connection: this.connection,
      shopCreatorAddress: this._candyShopCreatorAddress,
      shopTreasuryMint: this._treasuryMint,
      version: this._version,
      env: this._env,
      tokenAccount,
      tokenMint,
      wallet
    });

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
      connection: this.connection,
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
    const { nftOwnerTokenAccount, masterMint, whitelistMint, editionBuyer, mintEditionNumber } = params;

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
      this._programId
    );
    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, this._treasuryMint);

    const { instructions, newEditionMint, newEditionTokenAccount } = await createNewMintInstructions(
      editionBuyer.publicKey,
      this.connection
    );

    const txHash = await CandyShopDrop.mintPrint({
      candyShop: this._candyShopAddress,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      isEnterprise: this._isEnterprise,
      connection: this.connection,
      candyShopProgram: this.getStaticProgram(editionBuyer),
      treasuryMint: this._treasuryMint,
      mintEditionNumber,
      instructions,
      newEditionMint,
      newEditionTokenAccount
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
      connection: this.connection,
      candyShopProgram: this.getStaticProgram(nftOwner)
    });

    return txHash;
  }

  /**
   * Fetch stats associated with this Candy Shop
   */
  public stats(): Promise<ShopStats> {
    return fetchStatsByShopAddress(this.candyShopAddress);
  }
  /**
   * Fetch transactions made through this Candy Shop
   *
   * * @param {number[]} identifiers optional list of identifiers to apply to query string
   */
  public transactions(queryDto: TradeQuery): Promise<ListBase<Trade>> {
    return fetchTradeByShopAddress(this.candyShopAddress, queryDto);
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
    return fetchOrdersByShopAddress(this.candyShopAddress, ordersFilterQuery);
  }
  /**
   * Fetch child edition order associated with master edition
   *
   * @param {OrdersEditionFilterQuery} ordersEditionFilterQuery filters to apply to search
   * @param {string} masterMint base 58 encoded mint key string
   */
  public childEditionOrders(
    masterMint: string,
    ordersEditionFilterQuery: OrdersEditionFilterQuery
  ): Promise<ListBase<Order>> {
    return fetchOrdersByShopAndMasterEditionMint(this.candyShopAddress, masterMint, ordersEditionFilterQuery);
  }
  /**
   * Fetch active orders created by specified wallet address
   *
   * @param {string} walletAddress base 58 encoded public key string
   */
  public activeOrdersByWalletAddress(walletAddress: string): Promise<Order[]> {
    return fetchOrdersByShopAndWalletAddress(this.candyShopAddress, walletAddress);
  }
  /**
   * Fetch list of whitelisted NFTs for this Candy Shop
   */
  public shopWlNfts(): Promise<ListBase<WhitelistNft>> {
    return fetchShopWhitelistNftByShopAddress(this.candyShopAddress);
  }
  /**
   * Fetch active orders associated with specified mint address
   *
   * @param {string} mintAddress base 58 encoded mint key string
   */
  public activeOrderByMintAddress(mintAddress: string): Promise<SingleBase<Order>> {
    return fetchOrderByShopAndMintAddress(this.candyShopAddress, mintAddress);
  }
  /**
   * Fetch the data for Candy Shop with this Shop's public key
   */
  public fetchShopByShopId(): Promise<SingleBase<CandyShopResponse>> {
    return fetchShopByShopAddress(this.candyShopAddress);
  }
}
