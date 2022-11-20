import { BN } from '@project-serum/anchor';
import {
  CandyShopTradeBuyParams,
  CandyShopTradeCancelParams,
  CandyShopTradeSellParams
} from './shop/sol/CandyShopModel';
import {
  buyAndExecuteSale,
  BuyAndExecuteSaleTransactionParams,
  buyAndExecuteSaleV1,
  cancelOrder,
  cancelOrderV1,
  CancelTransactionParams,
  sellNft,
  sellNftV1,
  SellTransactionParams
} from './factory/conveyor/sol';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShopVersion,
  getMetadataAccount,
  getProgram
} from './vendor';
import { proceedToBuy, supply } from './vendor/shipping';

/**
 * A abstract class to provide static trading methods without CandyShop instance but partial information from shop.
 */
export abstract class CandyShopTrade {
  static async buy(params: CandyShopTradeBuyParams): Promise<string> {
    const {
      connection,
      seller,
      tokenAccount,
      tokenMint,
      price,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress,
      isEnterprise
    } = params;

    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);
    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const buyTxHashParams: BuyAndExecuteSaleTransactionParams = {
      wallet,
      counterParty: seller,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: shopTreasuryMint,
      auctionHouseTreasury: treasuryAccount,
      metadata,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop: shopAddress,
      price,
      amount: new BN(1),
      program: getProgram(connection, candyShopProgramId, wallet)
    };
    const txHash = await proceedToBuy(isEnterprise, {
      params: buyTxHashParams,
      version: getCandyShopVersion(candyShopProgramId),
      v1Func: buyAndExecuteSaleV1,
      v2Func: buyAndExecuteSale
    });

    return txHash;
  }

  static async sell(params: CandyShopTradeSellParams): Promise<string> {
    const {
      connection,
      tokenAccount,
      tokenMint,
      price,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress
    } = params;

    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const sellTxParams: SellTransactionParams = {
      wallet,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: shopTreasuryMint,
      metadata,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop: shopAddress,
      price,
      amount: new BN(1),
      program: getProgram(connection, candyShopProgramId, wallet)
    };

    const candyShopVersion = getCandyShopVersion(candyShopProgramId);
    const txHash = await supply(sellTxParams, candyShopVersion, sellNftV1, sellNft);

    return txHash;
  }

  static async cancel(params: CandyShopTradeCancelParams): Promise<string> {
    const {
      connection,
      tokenAccount,
      tokenMint,
      price,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress
    } = params;

    const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      wallet.publicKey,
      tokenAccount,
      shopTreasuryMint,
      tokenMint,
      new BN(1),
      price
    );

    const cancelTxParams: CancelTransactionParams = {
      wallet,
      tokenAccount,
      tokenAccountMint: tokenMint,
      treasuryMint: shopTreasuryMint,
      authority: auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      tradeState,
      candyShop: shopAddress,
      price,
      amount: new BN(1),
      program: getProgram(connection, candyShopProgramId, wallet)
    };

    const candyShopVersion = getCandyShopVersion(candyShopProgramId);
    const txHash = await supply(cancelTxParams, candyShopVersion, cancelOrderV1, cancelOrder);

    return txHash;
  }
}
