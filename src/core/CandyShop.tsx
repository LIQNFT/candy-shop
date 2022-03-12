import { BN, Program, Provider } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
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
  getMetadataAccount,
} from '../api/utils';

/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _candyShopAddress: PublicKey;
  private _candyShopCreatorAddress: PublicKey;
  private _programId: PublicKey;
  private _env: Cluster;
  private _wallet: AnchorWallet;
  private _program: Program | undefined;

  constructor(
    candyShopAddress: PublicKey,
    candyShopCreatorAddress: PublicKey,
    candyShopProgramId: PublicKey,
    env: Cluster,
    wallet: AnchorWallet
  ) {
    this._candyShopAddress = candyShopAddress;
    this._candyShopCreatorAddress = candyShopCreatorAddress;
    this._programId = candyShopProgramId;
    this._env = env;
    this._wallet = wallet;
  }

  /**
   * Initiate the CandyShop object
   */
  async init() {
    const options = Provider.defaultOptions();
    const connection = new Connection(
      clusterApiUrl(this._env),
      options.commitment
    );
    const provider = new Provider(connection, this._wallet, options);
    const idl = await Program.fetchIdl(this._programId, provider);
    this._program = new Program(idl!, this._programId, provider);
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

  async buy(
    seller: PublicKey,
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    treasuryMint: PublicKey,
    price: BN
  ) {
    const [
      auctionHouseAuthority,
      authorityBump,
    ] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._programId
    );

    const [auctionHouse, auctionHouseBump] = await getAuctionHouse(
      auctionHouseAuthority,
      new PublicKey(treasuryMint)
    );
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);
    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const txHash = await buyAndExecuteSale(
      this._wallet,
      seller,
      tokenAccount,
      tokenMint,
      treasuryMint,
      treasuryAccount,
      metadata,
      auctionHouseAuthority,
      auctionHouseBump,
      auctionHouse,
      feeAccount,
      this._candyShopAddress,
      price,
      new BN(1),
      this._program!
    );

    console.log(txHash);
  }

  async sell(
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    treasuryMint: PublicKey,
    price: BN
  ) {
    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._programId
    );

    const [auctionHouse, auctionHouseBump] = await getAuctionHouse(
      auctionHouseAuthority,
      treasuryMint
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const txHash = await sellNft(
      this._wallet,
      tokenAccount,
      tokenMint,
      treasuryMint,
      metadata,
      auctionHouseAuthority,
      auctionHouseBump,
      auctionHouse,
      feeAccount,
      this._candyShopAddress,
      price,
      new BN(1),
      this._program!
    );

    console.log(txHash);
  }

  async cancel(
    tokenAccount: PublicKey,
    tokenMint: PublicKey,
    treasuryMint: PublicKey,
    price: BN
  ) {
    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      this._candyShopCreatorAddress,
      this._programId
    );

    const [auctionHouse, auctionHouseBump] = await getAuctionHouse(
      auctionHouseAuthority,
      new PublicKey(treasuryMint)
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      this._wallet.publicKey,
      tokenAccount,
      treasuryMint,
      tokenMint,
      new BN(1),
      price
    );

    const txHash = await cancelOrder(
      this._wallet,
      tokenAccount,
      tokenMint,
      auctionHouseAuthority,
      auctionHouseBump,
      auctionHouse,
      feeAccount,
      tradeState,
      this._candyShopAddress,
      price,
      new BN(1),
      this._program!
    );

    console.log(txHash);
  }

  async stats() {
    return fetchStatsById(this._candyShopAddress.toString());
  }

  async transactions() {
    return fetchTradeById(this._candyShopAddress.toString());
  }
}
