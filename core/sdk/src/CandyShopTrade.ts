import { BN } from '@project-serum/anchor';
import {
  buyAndExecuteSale,
  buyAndExecuteSales,
  BuyAndExecuteSaleTransactionParams,
  buyAndExecuteSaleV1,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getMetadataAccount,
  getProgram
} from './api';
import { CandyShopTradeBuyParams } from './CandyShopModel';

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
      isEnterprise,
      candyShopVersion
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
    const txHash = await buyAndExecuteSales(isEnterprise, {
      params: buyTxHashParams,
      version: candyShopVersion,
      v1Func: buyAndExecuteSaleV1,
      v2Func: buyAndExecuteSale
    });

    return txHash;
  }
}
