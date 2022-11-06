import {
  EthCandyShop,
  fetchAllEvmNftsFromWallet,
  FetchNFTBatchParam,
  FetchNFTCollectionParams,
  fetchShopByShopAddress,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import { Order, CandyShop as CandyShopResponse, SingleBase, Nft } from '@liqnft/candy-shop-types';
import { EthWallet } from 'model';
import { Store } from './catalog';

export class EthStore extends Store {
  private wallet: EthWallet;

  constructor(shop: EthCandyShop, wallet: EthWallet) {
    super(shop);
    this.wallet = wallet;
  }

  /* Implement required common methods */

  getShop(): Promise<CandyShopResponse> {
    return fetchShopByShopAddress(this.baseShop.candyShopAddress).then(
      (data: SingleBase<CandyShopResponse>) => data.result
    );
  }

  getNFTs(walletPublicKey: string, options: { candyShopAddress: string }): Promise<SingleTokenInfo[]> {
    const fetchBatchParam: FetchNFTBatchParam = { batchSize: 8 };
    const fetchNftParam: FetchNFTCollectionParams = { shopId: options.candyShopAddress };
    return fetchAllEvmNftsFromWallet(walletPublicKey, this.baseShop.env, fetchNftParam, fetchBatchParam);
  }

  getNftInfo(): Promise<Nft> {
    throw new Error('Method has not implemented.');
  }

  getOrderNft(): Promise<SingleBase<Order>> {
    throw new Error('Method has not implemented.');
  }

  async buy(order: Order): Promise<string> {
    if (!this.wallet) {
      throw new Error(`Invalid EthWallet`);
    }
    const providers = await this.wallet.web3Modal.connect();
    return this.baseShop.buy({
      orderUuid: order.txHash,
      providers
    });
  }

  async sell(nft: SingleTokenInfo, price: number): Promise<string> {
    if (!this.wallet?.web3Modal || !this.wallet?.publicKey) return Promise.reject('Wallet not found');
    const providers = await this.wallet?.web3Modal.connect();
    return this.baseShop.sell({
      price,
      nft,
      providers
    });
  }

  async cancel(order: Order): Promise<any> {
    const providers = await this.wallet?.web3Modal.connect();
    return this.baseShop.cancel({ providers, orderUuid: order.txHash });
  }
}
