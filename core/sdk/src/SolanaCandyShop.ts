import { Idl, Program, Provider, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from './CandyShop';

import { CandyShopDrop } from './CandyShopDrop';
import { CandyShopTrade } from './CandyShopTrade';
import { CANDY_SHOP_PROGRAM_ID, CANDY_SHOP_V2_PROGRAM_ID } from './factory/conveyor/sol/constants';
import {
  BidAuctionParams,
  BuyNowAuctionParams,
  CancelAuctionParams,
  CreateAuctionParams,
  SettleAndDistributeProceedParams,
  WithdrawBidParams
} from './factory/conveyor/sol/model';
import {
  getAuction,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getCandyShopVersion,
  getMetadataAccount,
  getProgram
} from './factory/conveyor/sol/utils/programUtils';
import {
  bidAuctionV1,
  buyNowAuctionV1,
  cancelAuctionV1,
  createAuctionV1,
  settleAndDistributeProceedsV1,
  withdrawBidV1
} from './factory/conveyor/sol/v1/auction';
import { bidAuction } from './factory/conveyor/sol/v2/auction/bid';
import { buyNowAuction } from './factory/conveyor/sol/v2/auction/buyNow';
import { cancelAuction } from './factory/conveyor/sol/v2/auction/cancel';
import { createAuction } from './factory/conveyor/sol/v2/auction/create';
import { settleAndDistributeProceeds } from './factory/conveyor/sol/v2/auction/settleAndDistribute';
import { withdrawBid } from './factory/conveyor/sol/v2/auction/withdraw';
import { CandyShopError, CandyShopErrorType } from './factory/error';
import {
  CandyShopBidAuctionParams,
  CandyShopBuyNowParams,
  CandyShopBuyParams,
  CandyShopCancelAuctionParams,
  CandyShopCancelParams,
  CandyShopCommitNftParams,
  CandyShopConstructorParams,
  CandyShopCreateAuctionParams,
  CandyShopMintPrintParams,
  CandyShopRedeemParams,
  CandyShopSellParams,
  CandyShopSettings,
  CandyShopSettleAndDistributeParams,
  CandyShopVersion,
  CandyShopWithdrawAuctionBidParams
} from './SolanaCandyShopModel';
import { Blockchain } from './CandyShopModel';
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

export class SolanaCandyShop implements CandyShop {
  private _candyShopAddress: web3.PublicKey;
  private _candyShopCreatorAddress: web3.PublicKey;
  private _treasuryMint: web3.PublicKey;
  private _programId: web3.PublicKey;
  private _env: web3.Cluster;
  private _settings: CandyShopSettings;
  private _isEnterprise: boolean;
  private _version: CandyShopVersion;
  private _program: Program | undefined;

  /**
   * Instantiate a CandyShop object
   *
   * @param  {CandyShopConstructorParams} params
   *
   */
  constructor(params: CandyShopConstructorParams) {
    const { candyShopCreatorAddress, treasuryMint, programId, env, settings, isEnterprise } = params;

    this.verifyProgramId(programId);

    if (isEnterprise && !programId.equals(CANDY_SHOP_V2_PROGRAM_ID)) {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    this._candyShopAddress = getCandyShopSync(candyShopCreatorAddress, treasuryMint, programId)[0];
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._treasuryMint = treasuryMint;
    this._programId = programId;
    this._env = env ?? 'devnet';
    this._isEnterprise = isEnterprise ? true : false;
    this._version = getCandyShopVersion(programId);
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
    console.log('CandyShop constructor: init CandyShop=', this);
    configBaseUrl(env);
  }

  private verifyProgramId(programId: web3.PublicKey) {
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

  shopId(): string {
    return this._candyShopAddress.toString();
  }

  ownerAddress(): string {
    return this._candyShopCreatorAddress.toString();
  }

  treasuryMint(): string {
    return this._treasuryMint.toString();
  }

  settings(): Partial<CandyShopSettings> {
    return this._settings;
  }

  blockchain(): Blockchain {
    return Blockchain.Solana;
  }

  /**
   * Executes Candy Shop __Buy__ and __ExecuteSale__ actions
   *
   * @param {CandyShopBuyParams} params required parameters for buy action
   */
  async marketplaceBuy(params: CandyShopBuyParams): Promise<string> {
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
  async marketplaceSell(params: CandyShopSellParams): Promise<string> {
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
  async marketplaceCancel(params: CandyShopCancelParams): Promise<string> {
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
      shopAddress: this._candyShopCreatorAddress,
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
    if (wallet.publicKey.toString() !== this._candyShopCreatorAddress.toString()) {
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

    if (wallet.publicKey.toString() !== this._candyShopCreatorAddress.toString()) {
      throw new CandyShopError(CandyShopErrorType.NonShopOwner);
    }

    console.log(`${Logger}: Performing cancel auction `, {
      tokenMint: tokenMint.toString(),
      tokenAccount: tokenAccount.toString()
    });

    const program = await this.getStaticProgram(wallet);

    const [auction, auctionBump] = await getAuction(new web3.PublicKey(this.shopId()), tokenMint, this._programId);

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
      candyShop: new web3.PublicKey(this.shopId()),
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

    const [auction] = await getAuction(new web3.PublicKey(this.shopId()), tokenMint, this._programId);

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
      this._programId
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
}
