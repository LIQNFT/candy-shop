import { Keypair, PublicKey } from '@solana/web3.js';
import { sellNft, SellNftAccounts, SellNftData } from '../api/program/sell';
import {
  getAuctionHouseAuthority,
  getAuctionHouse,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getAuctionHouseEscrow,
  getAuctionHouseTradeState,
  getAuctionHouseProgramAsSigner,
} from '../api/utils';
import * as anchor from '@project-serum/anchor';
import {
  buyAndExecuteSale,
  BuyAndExecuteSaleAccounts,
  BuyAndExecuteSaleData,
} from '../api/program/buyAndExecuteSale';
import {
  cancelOrder,
  CancelOrderAccounts,
  CancelOrderData,
} from '../api/program/cancel';
/**
 * Core Candy Shop module
 */
export class CandyShop {
  private _candyShopAddress: PublicKey;
  private candyShopCreatorAddress: PublicKey;
  private program: anchor.Program;

  constructor(candyShopAddress: string, candyShopCreatorAddress: string, program: anchor.Program) {
    this._candyShopAddress = new PublicKey(candyShopAddress);
    this.candyShopCreatorAddress = new PublicKey(candyShopCreatorAddress);

    this.program = program;
  }

  // TODO
  async getOrders() {
    return this._candyShopAddress;
  }

  // TODO
  async buy(
    walletKeyPair: Keypair,
    seller: PublicKey,
    tokenAccount: PublicKey,
    tokenAccountMint: PublicKey,
    treasuryMint: PublicKey,
    metadata: PublicKey,
    price: anchor.BN,
    amount: anchor.BN,
    program: anchor.Program
  ) {
    const [authority, authorityBump] = await getAuctionHouseAuthority(
      this.candyShopCreatorAddress,
      program.programId
    );

    const [auctionHouse] = await getAuctionHouse(authority, treasuryMint);

    const [auctionHouseTreasury] = await getAuctionHouseTreasuryAcct(
      auctionHouse
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [buyerEscrow, buyerEscrowBump] = await getAuctionHouseEscrow(
      auctionHouse,
      walletKeyPair.publicKey
    );

    const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
      auctionHouse,
      walletKeyPair.publicKey,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      price
    );

    const [sellerTradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      seller,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      price
    );

    const [
      freeTradeState,
      freeTradeStateBump,
    ] = await getAuctionHouseTradeState(
      auctionHouse,
      seller,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      new anchor.BN(0)
    );

    const [
      programAsSigner,
      programAsSignerBump,
    ] = await getAuctionHouseProgramAsSigner();

    const accounts: BuyAndExecuteSaleAccounts = {
      walletKeyPair: walletKeyPair,
      seller,
      tokenAccount,
      tokenAccountMint,
      treasuryMint,
      auctionHouseTreasury,
      metadata,
      authority,
      auctionHouse,
      tradeState,
      buyerEscrow,
      sellerTradeState,
      freeTradeState,
      programAsSigner,
      feeAccount,
      candyShop: this._candyShopAddress,
    };

    const data: BuyAndExecuteSaleData = {
      price,
      amount,
      tradeStateBump,
      buyerEscrowBump,
      authorityBump,
      freeTradeStateBump,
      programAsSignerBump,
    };

    await buyAndExecuteSale(accounts, data, this.program);
  }

  // TODO
  async sell(
    walletKeyPair: Keypair,
    tokenAccount: PublicKey,
    tokenAccountMint: PublicKey,
    treasuryMint: PublicKey,
    metadata: PublicKey,
    price: anchor.BN,
    amount: anchor.BN,
    program: anchor.Program
  ) {
    const [authority, authorityBump] = await getAuctionHouseAuthority(
      this.candyShopCreatorAddress,
      program.programId
    );

    const [auctionHouse] = await getAuctionHouse(authority, treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState, tradeStateBump] = await getAuctionHouseTradeState(
      auctionHouse,
      walletKeyPair.publicKey,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      price
    );

    const [
      freeTradeState,
      freeTradeStateBump,
    ] = await getAuctionHouseTradeState(
      auctionHouse,
      walletKeyPair.publicKey,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      new anchor.BN(0)
    );

    const [
      programAsSigner,
      programAsSignerBump,
    ] = await getAuctionHouseProgramAsSigner();

    const accounts: SellNftAccounts = {
      walletKeyPair,
      tokenAccount,
      metadata,
      authority,
      auctionHouse,
      tradeState,
      freeTradeState,
      feeAccount,
      candyShop: this._candyShopAddress,
      programAsSigner,
    };

    const data: SellNftData = {
      price,
      amount,
      tradeStateBump,
      freeTradeStateBump,
      programAsSignerBump,
      authorityBump,
    };

    await sellNft(accounts, data, this.program);
  }

  // TODO
  async cancel(
    walletKeyPair: Keypair,
    tokenAccount: PublicKey,
    tokenAccountMint: PublicKey,
    treasuryMint: PublicKey,
    amount: anchor.BN,
    price: anchor.BN
  ) {
    const [authority, authorityBump] = await getAuctionHouseAuthority(
      this.candyShopCreatorAddress,
      this.program.programId
    );

    const [auctionHouse] = await getAuctionHouse(authority, treasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      walletKeyPair.publicKey,
      tokenAccount,
      treasuryMint,
      tokenAccountMint,
      amount,
      price
    );

    const accounts: CancelOrderAccounts = {
      walletKeyPair,
      tokenAccount,
      tokenAccountMint,
      authority,
      auctionHouse,
      feeAccount,
      tradeState,
      candyShop: this._candyShopAddress,
    };

    const data: CancelOrderData = {
      price,
      amount,
      authorityBump,
    };

    await cancelOrder(accounts, data, this.program);
  }

  // TODO
  async getStats() {}

  // TODO
  async getTransactions() {}
}
