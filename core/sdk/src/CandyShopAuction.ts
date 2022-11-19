import { Auction, AuctionBid, AuctionBidQuery, ListBase, SingleBase, AuctionQuery } from '@liqnft/candy-shop-types';
import { fetchAuctionBid, fetchAuctionHistoryByAddress, fetchAuctionsByShop } from './factory/backend';
import axiosInstance from './vendor/config';
import {
  getAuction,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getMetadataAccount,
  getProgram,
  CandyShopErrorType
} from './vendor';
import {
  CandyShopAuctionBuyNowParams,
  CandyShopAuctionBidParams,
  CandyShopAuctionWithdrawBidParams
} from './shop/sol/CandyShopModel';
import {
  buyNowAuction,
  BuyNowAuctionParams,
  buyNowAuctionV1,
  BidAuctionParams,
  bidAuction,
  bidAuctionV1,
  WithdrawBidParams,
  withdrawBidV1,
  withdrawBid
} from './factory/conveyor/sol';
import { supply } from './vendor/shipping';

export function fetchAuctionsByShopAddress(shopId: string, queryDto?: AuctionQuery): Promise<ListBase<Auction>> {
  return fetchAuctionsByShop(axiosInstance, shopId, queryDto);
}

export function fetchAuctionBidByWalletAddress(
  auctionAddress: string,
  walletAddress: string
): Promise<SingleBase<AuctionBid>> {
  return fetchAuctionBid(axiosInstance, auctionAddress, walletAddress);
}

export function fetchAuctionHistory(
  auctionAddress: string,
  auctionBidQuery?: AuctionBidQuery
): Promise<ListBase<AuctionBid>> {
  return fetchAuctionHistoryByAddress(axiosInstance, auctionAddress, auctionBidQuery);
}

export abstract class CandyShopAuction {
  static async buyNow(params: CandyShopAuctionBuyNowParams): Promise<string> {
    const {
      tokenMint,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress,
      connection,
      env,
      version
    } = params;

    const program = await getProgram(connection, candyShopProgramId, wallet);

    const [auction, auctionBump] = await getAuction(shopAddress, tokenMint, candyShopProgramId);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const buyNowParams: BuyNowAuctionParams = {
      auction,
      auctionBump,
      authority: auctionHouseAuthority,
      candyShop: shopAddress,
      buyer: wallet,
      treasuryMint: shopTreasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      treasuryAccount,
      program,
      env: env
    };

    const txHash = await supply(buyNowParams, version, buyNowAuctionV1, buyNowAuction);

    return txHash;
  }

  static async bid(params: CandyShopAuctionBidParams): Promise<string> {
    const {
      tokenMint,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress,
      connection,
      version,
      bidPrice
    } = params;

    const program = await getProgram(connection, candyShopProgramId, wallet);

    const [auction] = await getAuction(shopAddress, tokenMint, candyShopProgramId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const bidParams: BidAuctionParams = {
      auction,
      authority: auctionHouseAuthority,
      candyShop: shopAddress,
      buyer: wallet,
      treasuryMint: shopTreasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      bidPrice,
      program
    };

    const txHash = await supply(bidParams, version, bidAuctionV1, bidAuction);

    return txHash;
  }

  static async withdrawBid(params: CandyShopAuctionWithdrawBidParams): Promise<string> {
    const {
      tokenMint,
      wallet,
      shopAddress,
      candyShopProgramId,
      shopTreasuryMint,
      shopCreatorAddress,
      connection,
      version
    } = params;

    const program = await getProgram(connection, candyShopProgramId, wallet);

    const [auction] = await getAuction(shopAddress, tokenMint, candyShopProgramId);

    const auctionAccount = await program.provider.connection.getAccountInfo(auction);

    if (!auctionAccount) {
      throw new Error(CandyShopErrorType.AuctionDoesNotExist);
    }

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      shopCreatorAddress,
      shopTreasuryMint,
      candyShopProgramId
    );

    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, shopTreasuryMint);

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(tokenMint);

    const withdrawBidParams: WithdrawBidParams = {
      auction,
      authority: auctionHouseAuthority,
      candyShop: shopAddress,
      buyer: wallet,
      treasuryMint: shopTreasuryMint,
      nftMint: tokenMint,
      metadata,
      auctionHouse,
      feeAccount,
      program
    };

    const txHash = await supply(withdrawBidParams, version, withdrawBidV1, withdrawBid);

    return txHash;
  }
}
