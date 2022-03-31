import { BN, Program, Provider } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { configBaseUrl } from 'config/axiosInstance';
import { fetchOrdersByStoreId } from '../api/backend/OrderAPI';
import { fetchStatsById } from '../api/backend/StatsAPI';
import { fetchTradeById } from '../api/backend/TradeAPI';
import { buyAndExecuteSale } from '../api/program/buyAndExecuteSale';
import { cancelOrder } from '../api/program/cancel';
import { sellNft } from '../api/program/sell';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShopSync,
  getMetadataAccount,
} from '../api/utils';
/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _candyShopAddress: PublicKey;
  private _candyShopCreatorAddress: PublicKey;
  private _treasuryMint: PublicKey;
  private _programId: PublicKey;
  private _env: Cluster;
  private _wallet: AnchorWallet;
  private _program: Program | undefined;

  constructor(
    candyShopCreatorAddress: PublicKey,
    treasuryMint: PublicKey,
    candyShopProgramId: PublicKey,
    env: Cluster,
    wallet: AnchorWallet
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
    this._wallet = wallet;
    configBaseUrl(env);
  }
  /**
   * Initiate the CandyShop object
   */
  async initIfNotReady() {
    if (typeof this._program === 'undefined') {
      const options = Provider.defaultOptions();
      const connection = new Connection(
        clusterApiUrl(this._env),
        options.commitment
      );
      const provider = new Provider(connection, this._wallet, options);
      console.log('fetching idl for programId', this._programId.toString());

      const idl = await Program.fetchIdl(this._programId, provider);
      this._program = new Program(idl!, this._programId, provider);
    }
  }

  treasuryMint(): PublicKey {
    return this._treasuryMint;
  }

  connectedPublicKey(): PublicKey | undefined {
    return this._program?.provider.wallet.publicKey;
  }

  candyShopAddress() {
    return this._candyShopAddress;
  }

  candyShopCreatorAddress() {
    return this._candyShopCreatorAddress;
  }

  candyShopProgramId() {
    return this._programId;
  }

  async orders() {
    return fetchOrdersByStoreId(this._candyShopAddress.toString());
  }

  public async buy(
    seller: PublicKey,
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    price: BN
  ): Promise<string> {
    console.log('buy called');
    await this.initIfNotReady();
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
      this._wallet,
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
      this._program!
    );

    return txHash;
  }

  public async sell(
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    price: BN
  ): Promise<string> {
    await this.initIfNotReady();
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
      this._wallet,
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
      this._program!
    );
    return txHash;
  }

  async cancel(
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    price: BN
  ): Promise<string> {
    await this.initIfNotReady();
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
      this._wallet.publicKey,
      tokenAccount,
      this._treasuryMint,
      tokenMint,
      new BN(1),
      price
    );

    const txHash = await cancelOrder(
      this._wallet,
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
      this._program!
    );

    return txHash;
  }

  public async stats() {
    return fetchStatsById(this._candyShopAddress.toString());
  }

  async transactions() {
    return fetchTradeById(this._candyShopAddress.toString());
  }
}
