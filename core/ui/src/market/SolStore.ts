import {
  CandyShop,
  CandyShopCreateAuctionParams,
  CandyShopTrade,
  CandyShopTradeBuyParams,
  CandyShopTradeCancelParams,
  CandyShopTradeSellParams,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  fetchShopWhitelistNftByShopAddress,
  getCandyShopSync,
  getTokenMetadataByMintAddress,
  NftMetadata,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import {
  Order,
  Auction,
  WhitelistNft,
  ListBase,
  SingleBase,
  Nft,
  CandyShop as CandyShopResponse
} from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { SolSellerOptions, Store, Auctionner } from './catalog';

export class SolStore extends Store implements Auctionner {
  private candyShop: CandyShop;
  private wallet: AnchorWallet;
  private connection: web3.Connection;
  private isEnterprise: boolean;

  constructor(shop: CandyShop, wallet: AnchorWallet, connection: web3.Connection, isEnterprise: boolean) {
    super(shop);
    this.candyShop = shop;
    this.wallet = wallet;
    this.connection = connection;
    this.isEnterprise = isEnterprise;
  }

  /* Specific methods for Sols */

  getTokenMetadataByMintAddress(mintAddress: string, connection: web3.Connection): Promise<NftMetadata> {
    return getTokenMetadataByMintAddress(mintAddress, connection);
  }

  getShopIdentifiers(candyShopAddress: string): Promise<string[]> {
    return fetchShopWhitelistNftByShopAddress(candyShopAddress).then((nfts: ListBase<WhitelistNft>) =>
      nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
    );
  }

  /* Implement required common methods */

  getShop(): Promise<CandyShopResponse> {
    const candyShopAddress = this.baseShop.candyShopAddress.toString();
    return fetchShopByShopAddress(candyShopAddress).then((data: SingleBase<CandyShopResponse>) => data.result);
  }

  async getNFTs(
    walletPublicKey: string,
    options: { enableCacheNFT?: boolean; allowSellAnyNft?: number; candyShopAddress: string }
  ): Promise<SingleTokenInfo[]> {
    const fetchBatchParam: any = {
      batchSize: 8
    };
    // Enable cache nft, store nft token in IDB and get nft token from IDB.
    // CandyShopSDK will always keep up-to-date status from chain in IDB once fetchNFT is called.
    const cacheNFTParam: any = {
      enable: options.enableCacheNFT ?? false
    };

    const identifiers = options.allowSellAnyNft ? undefined : await this.getShopIdentifiers(options.candyShopAddress);

    return fetchNftsFromWallet(
      this.connection,
      new web3.PublicKey(walletPublicKey),
      identifiers,
      fetchBatchParam,
      cacheNFTParam
    );
  }

  getOrderNft(tokenMint: string): Promise<SingleBase<Order>> {
    return this.candyShop.activeOrderByMintAddress(tokenMint);
  }

  getNftInfo(tokenMint: string): Promise<Nft> {
    return this.candyShop.nftInfo(tokenMint);
  }

  buy(order: Order): Promise<string> {
    if (!this.wallet?.publicKey) {
      throw new Error(`Invalid Anchor wallet or publicKey doesn't exist`);
    }
    if (!this.connection) {
      throw new Error(`Invalid Solana shop connection`);
    }

    const shopAddress = getCandyShopSync(
      new web3.PublicKey(order.candyShopCreatorAddress),
      new web3.PublicKey(order.treasuryMint),
      new web3.PublicKey(order.programId)
    )[0].toString();

    const tradeBuyParams: CandyShopTradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: this.wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: this.connection,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(order.programId),
      isEnterprise: this.isEnterprise,
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams);
  }

  sell(nft: SingleTokenInfo, price: number, options: SolSellerOptions): Promise<string> {
    const { baseUnitsPerCurrency, shopAddress, shopCreatorAddress, shopTreasuryMint, candyShopProgramId } =
      options as SolSellerOptions;

    if (!this.wallet) return Promise.reject('Wallet not found');
    if (!candyShopProgramId) return Promise.reject('candyShopProgramId not found');

    const tradeSellParams: CandyShopTradeSellParams = {
      connection: this.connection,
      tokenAccount: new web3.PublicKey(nft.tokenAccountAddress),
      tokenMint: new web3.PublicKey(nft.tokenMintAddress),
      price: new BN(price * baseUnitsPerCurrency),
      wallet: this.wallet,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(candyShopProgramId),
      shopTreasuryMint: new web3.PublicKey(shopTreasuryMint),
      shopCreatorAddress: new web3.PublicKey(shopCreatorAddress)
    };

    return CandyShopTrade.sell(tradeSellParams);
  }

  cancel(order: Order): Promise<string> {
    if (!this.wallet?.publicKey) {
      throw new Error(`Invalid wallet or publicKey doesn't exist`);
    }

    const shopAddress =
      getCandyShopSync(
        new web3.PublicKey(order.candyShopCreatorAddress),
        new web3.PublicKey(order.treasuryMint),
        new web3.PublicKey(order.programId)
      )[0].toString() || '';

    const tradeCancelParams: CandyShopTradeCancelParams = {
      connection: this.connection,
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: this.wallet,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(order.programId),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint),
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress)
    };

    return CandyShopTrade.cancel(tradeCancelParams);
  }

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
      bidPrice: new BN(price * this.baseShop.baseUnitsPerCurrency)
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

  createAuction(params: CandyShopCreateAuctionParams): Promise<string> {
    return this.candyShop.createAuction(params);
  }
}
