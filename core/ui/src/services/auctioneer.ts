import { BlockchainType } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ShopProps } from 'model';
import Handler from './handler';

export abstract class Auctioneer<T extends keyof typeof BlockchainType> extends Handler<T> {
  abstract createAuction(params: unknown): Promise<string>;
  abstract buyNowAuction(auction: Auction): Promise<string>;
  abstract bidAuction(auction: Auction, price: number): Promise<string>;
  abstract withdrawAuctionBid(auction: Auction): Promise<string>;
}

class SolanaAuctioneer extends Auctioneer<'Solana'> {
  withdrawAuctionBid(auction: Auction): Promise<string> {
    if (!this.wallet) return Promise.reject('Wallet not found');

    return this.candyShop.withdrawAuctionBid({
      wallet: this.wallet,
      tokenMint: new web3.PublicKey(auction.tokenMint),
      tokenAccount: new web3.PublicKey(auction.tokenAccount)
    });
  }

  bidAuction(auction: Auction, price: number): Promise<string> {
    if (!this.wallet) return Promise.reject('Wallet not found');

    return this.candyShop.bidAuction({
      wallet: this.wallet,
      tokenMint: new web3.PublicKey(auction.tokenMint),
      tokenAccount: new web3.PublicKey(auction.tokenAccount),
      bidPrice: new BN(price * this.candyShop.baseUnitsPerCurrency)
    });
  }

  buyNowAuction(auction: Auction): Promise<string> {
    if (!this.wallet) return Promise.reject('Wallet not found');

    return this.candyShop.buyNowAuction({
      wallet: this.wallet,
      tokenMint: new web3.PublicKey(auction.tokenMint),
      tokenAccount: new web3.PublicKey(auction.tokenAccount)
    });
  }

  createAuction(params: any): Promise<string> {
    return this.candyShop.createAuction(params);
  }
}

export const AuctioneerFactory = ({ blockchain, candyShop, wallet }: ShopProps): Auctioneer<any> => {
  switch (blockchain) {
    default:
      return new SolanaAuctioneer({ candyShop, wallet: wallet as AnchorWallet });
  }
};
