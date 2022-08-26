import {
  BlockchainType,
  fetchAllEvmNftsFromWallet,
  fetchNftsFromWallet,
  fetchOrdersByShopAndWalletAddress,
  fetchShopByShopAddress,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import {
  CandyShop as CandyShopResponse,
  ListBase,
  Nft,
  Order,
  SingleBase,
  WhitelistNft
} from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { EthWallet, ShopProps } from './../model';
import Handler from './handler';

abstract class ShopData<T extends keyof typeof BlockchainType> extends Handler<T> {
  abstract getShop(): Promise<CandyShopResponse>;
  abstract getNFTs(
    walletPublicKey: string,
    options: { enableCacheNFT?: boolean; allowSellAnyNft?: number }
  ): Promise<SingleTokenInfo[]>;
  abstract getOrderNft(tokenMint: string): Promise<SingleBase<Order>>;
  abstract getNftInfo(tokenMint: string): Promise<Nft>;

  getOrderNfts(publicKey: string): Promise<Order[]> {
    return fetchOrdersByShopAndWalletAddress(this.candyShop.candyShopAddress, publicKey);
  }
}

class SolanaShopData extends ShopData<'Solana'> {
  getShop(): Promise<CandyShopResponse> {
    const candyShopAddress = this.candyShop.candyShopAddress.toString();
    return fetchShopByShopAddress(candyShopAddress).then((data) =>
      data.success ? data.result : ({} as CandyShopResponse)
    );
  }

  getNftInfo(tokenMint: string): Promise<Nft> {
    return this.candyShop.nftInfo(tokenMint);
  }

  async getNFTs(
    walletPublicKey: string,
    options: { enableCacheNFT?: boolean; allowSellAnyNft?: number }
  ): Promise<SingleTokenInfo[]> {
    const fetchBatchParam: any = {
      batchSize: 8
    };
    // Enable cache nft, store nft token in IDB and get nft token from IDB.
    // CandyShopSDK will always keep up-to-date status from chain in IDB once fetchNFT is called.
    const cacheNFTParam: any = {
      enable: options.enableCacheNFT ?? false
    };

    const identifiers = options.allowSellAnyNft ? undefined : await this.getShopIdentifiers();

    return fetchNftsFromWallet(
      this.candyShop.connection,
      new web3.PublicKey(walletPublicKey),
      identifiers,
      fetchBatchParam,
      cacheNFTParam
    );
  }

  getOrderNft(tokenMint: string): Promise<SingleBase<Order>> {
    return this.candyShop.activeOrderByMintAddress(tokenMint);
  }

  getShopIdentifiers() {
    return this.candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
      );
  }
}

class EthShopData extends ShopData<'Ethereum'> {
  getShop(): Promise<CandyShopResponse> {
    return fetchShopByShopAddress(this.candyShop.candyShopAddress).then(
      (data: SingleBase<CandyShopResponse>) => data.result
    );
  }

  getNftInfo(): Promise<Nft> {
    throw new Error('Method not implemented.');
  }

  getOrderNft(): Promise<SingleBase<Order>> {
    throw new Error('Method not implemented.');
  }

  getNFTs(walletPublicKey: string): Promise<SingleTokenInfo[]> {
    const fetchBatchParam = { batchSize: 8 };

    return fetchAllEvmNftsFromWallet(walletPublicKey, this.candyShop.env, fetchBatchParam);
  }

  getOrderNfts(publicKey: string): Promise<Order[]> {
    return fetchOrdersByShopAndWalletAddress(this.candyShop.candyShopAddress, publicKey);
  }
}

export const ShopDataFactory = ({ blockchain, candyShop, wallet }: ShopProps): ShopData<any> => {
  switch (blockchain) {
    case BlockchainType.Ethereum:
      return new EthShopData({ candyShop, wallet: wallet as EthWallet });
    default:
      return new SolanaShopData({ candyShop, wallet: wallet as AnchorWallet });
  }
};
