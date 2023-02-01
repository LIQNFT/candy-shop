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
import {
  CandyShopCommitNftParams,
  CandyShopMintPrintParams,
  CandyShopUpdateEditionVaultParams
} from './CandyShopModel';
import { CandyShopDrop, createNewMintInstructions } from '../../CandyShopDrop';
import {
  fetchNFTByMintAddress,
  fetchOrderByShopAndMintAddress,
  fetchOrdersByShopAddress,
  fetchOrdersByShopAndMasterEditionMint,
  fetchOrdersByShopAndWalletAddress,
  fetchShopByShopAddress,
  fetchShopsByIdentifier,
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
} from '../../factory/conveyor/sol';
import {
  CandyShopError,
  CandyShopErrorType,
  getAuction,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getCandyShopVersion,
  getMetadataAccount,
  getProgram,
  safeAwait
} from '../../vendor';
import { supply } from '../../vendor/shipping';
import { BaseShop, BaseShopConstructorParams, CandyShopAuctioneer, CandyShopEditionDropper } from '../base/BaseShop';
import { CandyShopVersion, ExplorerLinkBase, ShopSettings } from '../base/BaseShopModel';
import { Cluster, PublicKey } from '@solana/web3.js';

const Logger = 'CandyShop';

const DEFAULT_PRICE_DECIMALS = 3;
const DEFAULT_PRICE_DECIMALS_MIN = 0;
const DEFAULT_VOLUME_DECIMALS = 1;
const DEFAULT_VOLUME_DECIMALS_MIN = 0;

export interface SolShopConstructorParams extends BaseShopConstructorParams {
  isEnterprise?: boolean;
  accessToken?: string;
}

export interface SolShopInitParams extends Omit<SolShopConstructorParams, 'settings'> {
  settings: Partial<ShopSettings>;
}

/**
 * Parameters to CandyShop constructor
 *
 * @property {PublicKey} candyShopCreatorAddressCreator shop creator's wallet address
 * @property {PublicKey} treasuryMintTreasury currency to buy and sell with
 * @property {PublicKey} candyShopProgramId Candy Shop program id
 * @property {Blockchain} env the network setup for the shop to get the data for
 * @property {Partial<CandyShopSettings>} settings Optional, additional shop settings
 * @property {boolean} isEnterprise Indicates if this shop uses enterprise program functionality. Defaults to false
 */
// TODO: make those web3.PublicKey to use string type for common constructor/getters

export class CandyShop extends BaseShop implements CandyShopAuctioneer, CandyShopEditionDropper {
  private _candyShopAddress: web3.PublicKey;
  private _isEnterprise: boolean;
  private _version: CandyShopVersion;
  private _program: Program | undefined;
  private _accessToken: string | undefined;

  static async initSolCandyShop(params: SolShopInitParams): Promise<CandyShop> {
    // Must config the endpoint before calling any CandyShop API
    BaseShop.configEndpoint(params.env);

    // Fetch required details for SOL setup
    const shopDetail = await safeAwait(
      fetchShopsByIdentifier(params.shopCreatorAddress, params.treasuryMint, params.programId)
    );

    if (shopDetail.error || !shopDetail.result || !shopDetail.result.success) {
      throw new Error(`${Logger} init, fetchShopsByIdentifier failed=${shopDetail.result?.msg}`);
    }

    const shopResponse: CandyShopResponse = shopDetail.result.result;

    const cluster: Cluster = params.env === Blockchain.SolDevnet ? 'devnet' : 'mainnet-beta';
    // First priority is to use connectionUrl from the response then the configured one, final is to fallback to default
    // connectionUrl could be empty string, use Logical instead of Nullish coalescing operators
    const connectionUrl = shopResponse.connectionUrl || params.settings?.connectionUrl || web3.clusterApiUrl(cluster);

    // Assign settings if any or fallback to default
    const candyShopSettings: ShopSettings = {
      currencySymbol: shopResponse.symbol,
      currencyDecimals: shopResponse.decimals,
      priceDecimals: params.settings?.priceDecimals ?? DEFAULT_PRICE_DECIMALS,
      priceDecimalsMin: params.settings?.priceDecimalsMin ?? DEFAULT_PRICE_DECIMALS_MIN,
      volumeDecimals: params.settings?.volumeDecimals ?? DEFAULT_VOLUME_DECIMALS,
      volumeDecimalsMin: params.settings?.volumeDecimalsMin ?? DEFAULT_VOLUME_DECIMALS_MIN,
      connectionUrl,
      connectionConfig: params.settings?.connectionConfig,
      explorerLink: params.settings?.explorerLink ?? ExplorerLinkBase.SolanaFM
    };

    const solanaParams: SolShopConstructorParams = {
      ...params,
      settings: candyShopSettings,
      accessToken: shopResponse.accessToken
    };

    const candyShop = new CandyShop(new PublicKey(shopResponse.candyShopAddress), solanaParams);
    return candyShop;
  }

  get candyShopAddress(): string {
    return this._candyShopAddress.toString();
  }

  get connectedPublicKey(): web3.PublicKey | undefined {
    return this._program?.provider.wallet.publicKey;
  }

  get isEnterprise(): boolean {
    return this._isEnterprise;
  }

  get version(): CandyShopVersion {
    return this._version;
  }

  /**
   * Get JSON rpc connection
   */
  get connection(): web3.Connection {
    const options = Provider.defaultOptions();
    let candyShopConnectionConfig = this._settings.connectionConfig;

    if (this._accessToken) {
      candyShopConnectionConfig = {
        ...candyShopConnectionConfig,
        httpHeaders: {
          Authorization: `Bearer ${this._accessToken}`,
          'CANDY-SHOP-ID': this._candyShopAddress.toString()
        }
      };
    }

    return new web3.Connection(this._settings.connectionUrl, candyShopConnectionConfig || options.commitment);
  }

  /**
   * Instantiate a CandyShop object
   *
   * @constructor
   * @param {CandyShopConstructorParams} params
   */
  private constructor(candyShopAddress: web3.PublicKey, params: SolShopConstructorParams) {
    const {
      programId,
      shopCreatorAddress: candyShopCreatorAddress,
      treasuryMint,
      env,
      settings: candyShopSettings,
      isEnterprise
    } = params;
    const candyShopProgramId = new PublicKey(programId);

    const baseShopParams: BaseShopConstructorParams = {
      shopCreatorAddress: candyShopCreatorAddress.toString(),
      treasuryMint: treasuryMint.toString(),
      programId: candyShopProgramId.toString(),
      env: env ?? Blockchain.SolDevnet,
      settings: candyShopSettings
    };

    // Apply common params to BaseShop
    super(baseShopParams);
    this.verifyProgramId(candyShopProgramId);
    if (isEnterprise && !candyShopProgramId.equals(CANDY_SHOP_V2_PROGRAM_ID)) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    this._candyShopAddress = candyShopAddress;
    this._isEnterprise = Boolean(isEnterprise);
    this._version = getCandyShopVersion(candyShopProgramId);
    this._accessToken = params.accessToken;

    console.log(`${Logger} constructor: instantiated CandyShop=`, this);
  }

  public verifyProgramId(programId: web3.PublicKey): void {
    switch (programId.toString()) {
      case CANDY_SHOP_PROGRAM_ID.toString():
      case CANDY_SHOP_V2_PROGRAM_ID.toString():
        return;
      default:
        throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }
  }

  /**
   * Gets anchor Program object for Candy Shop program
   *
   * @param {AnchorWallet | web3.Keypair} wallet Wallet or keypair of connected user
   */
  public getStaticProgram(wallet: AnchorWallet | web3.Keypair): Program<Idl> {
    if (this._program) return this._program;
    const programId = new web3.PublicKey(this.programId);
    return getProgram(this.connection, programId, wallet);
  }

  /**
   * Executes Candy Shop __UpdateCandyShop__ action
   *
   * @param {CandyShopUpdateParams} params required parameters for update action
   */
  public async updateCandyShop(params: CandyShopUpdateParams): Promise<string> {
    const { wallet, sellerFeeBasisPoint, requiresSignOff, canChangeSalePrice, split } = params;

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const treasuryMint = new web3.PublicKey(this._treasuryMint);
    const programId = new web3.PublicKey(this._programId);

    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      treasuryMint,
      programId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, treasuryMint);

    console.log(`${Logger}: performing update, `, {
      auctionHouse: auctionHouse.toString(),
      sellerFeeBasisPoint: sellerFeeBasisPoint ? sellerFeeBasisPoint.toString() : null
    });

    const updateCandyShopParams: UpdateCandyShopParams = {
      wallet,
      treasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopTrade.buy({
      connection: this.connection,
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      shopCreatorAddress,
      shopTreasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopTrade.sell({
      connection: this.connection,
      tokenAccount: tokenAccount,
      tokenMint: tokenMint,
      price: price,
      wallet: wallet,
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopTrade.cancel({
      connection: this.connection,
      tokenAccount: tokenAccount,
      tokenMint: tokenMint,
      price: price,
      wallet: wallet,
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const treasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, candyShopProgramId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (auctionAccount?.data) {
      throw new Error(CandyShopErrorType.AuctionExists);
    }
    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      treasuryMint,
      candyShopProgramId
    );

    const createAuctionParams: CreateAuctionParams = {
      seller: wallet,
      auction,
      authority: auctionHouseAuthority,
      auctionBump,
      candyShop: this._candyShopAddress,
      treasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const treasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, candyShopProgramId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }
    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      treasuryMint,
      candyShopProgramId
    );

    const cancelAuctionParams: CancelAuctionParams = {
      seller: wallet,
      auction,
      authority: auctionHouseAuthority,
      auctionBump,
      candyShop: this._candyShopAddress,
      treasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopAuction.bid({
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      connection: this.connection,
      shopCreatorAddress,
      shopTreasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopAuction.withdrawBid({
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      connection: this.connection,
      shopCreatorAddress,
      shopTreasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const shopTreasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const txHash = await CandyShopAuction.buyNow({
      shopAddress: this._candyShopAddress,
      candyShopProgramId,
      connection: this.connection,
      shopCreatorAddress,
      shopTreasuryMint,
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

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const treasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(this._candyShopAddress, tokenMint, candyShopProgramId);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      treasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const settleAndDistributeParams: SettleAndDistributeProceedParams = {
      auction,
      auctionBump,
      authority: auctionHouseAuthority,
      candyShop: this._candyShopAddress,
      settler: wallet,
      treasuryMint,
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
    const {
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      nftOwner,
      price,
      startTime,
      salesPeriod,
      whitelistTime,
      hasRedemption,
      inputSchema,
      description
    } = params;

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
      hasRedemption,
      whitelistTime,
      isEnterprise: this._isEnterprise,
      connection: this.connection,
      candyShopProgram: this.getStaticProgram(nftOwner),
      inputSchema,
      shopId: this.candyShopAddress,
      description
    });

    return txHash;
  }

  /**
   * Executes Edition Drop __ShopMintPrint__ or __EnterpriseMintPrint__ action
   *
   * @param {CandyShopMintPrintParams} params required parameters for mint print action
   */
  public async mintNewPrint(params: CandyShopMintPrintParams) {
    const { nftOwnerTokenAccount, masterMint, whitelistMint, editionBuyer, info } = params;

    if (this._version !== CandyShopVersion.V2) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    console.log(`${Logger}: performing mint print `, {
      masterNft: masterMint.toString(),
      nftOwner: nftOwnerTokenAccount.toString(),
      editionBuyer: editionBuyer.publicKey.toString(),
      whitelistMint: whitelistMint ? whitelistMint.toString() : undefined
    });

    const shopCreatorAddress = new web3.PublicKey(this._shopCreatorAddress);
    const treasuryMint = new web3.PublicKey(this._treasuryMint);
    const candyShopProgramId = new web3.PublicKey(this._programId);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      treasuryMint,
      candyShopProgramId
    );
    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, treasuryMint);

    const { instructions, newEditionMint, newEditionTokenAccount } = await createNewMintInstructions(
      editionBuyer.publicKey,
      this.connection
    );

    const mintPrintParams: Parameters<typeof CandyShopDrop.mintPrint>[0] = {
      candyShop: this._candyShopAddress,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      auctionHouse,
      isEnterprise: this._isEnterprise,
      connection: this.connection,
      candyShopProgram: this.getStaticProgram(editionBuyer),
      treasuryMint,
      instructions,
      newEditionMint,
      newEditionTokenAccount,
      info
    };

    const txHash = await CandyShopDrop.mintPrint(mintPrintParams);

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
   * Executes Edition Drop __UpdateVault__ action
   *
   * @param {CandyShopUpdateEditionVaultParams} params required parameters for update vault action
   */
  public async updateEditionVault(params: CandyShopUpdateEditionVaultParams) {
    const { nftOwner, nftOwnerTokenAccount, newPrice, masterMint } = params;

    if (this._version !== CandyShopVersion.V2) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    console.log(`${Logger}: performing update vault `, {
      masterNft: masterMint.toString(),
      newPrice: newPrice.toString()
    });

    const txHash = await CandyShopDrop.updateEditionVault({
      nftOwner,
      nftOwnerTokenAccount,
      masterMint,
      newPrice,
      candyShopProgram: this.getStaticProgram(nftOwner),
      isEnterprise: this.isEnterprise,
      connection: this.connection,
      candyShop: this._candyShopAddress
    });

    return txHash;
  }
  // TODO: Deprecate following info methods
  // The data can be fetched by using exposed APIs with very few params from CandyShop

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
