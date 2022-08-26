import { BlockchainType, CandyShopTrade, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { EthWallet, ShopProps } from 'model';
import Handler from './handler';

abstract class Buyer<T extends keyof typeof BlockchainType> extends Handler<T> {
  abstract buy(order: Order): Promise<string>;
}

class SolanaBuyer extends Buyer<'Solana'> {
  buy(order: Order): Promise<string> {
    if (!this.wallet?.publicKey || !this.candyShop.connection) return new Promise((res) => res(''));

    const shopAddress = getCandyShopSync(
      new web3.PublicKey(order.candyShopCreatorAddress),
      new web3.PublicKey(order.treasuryMint),
      new web3.PublicKey(order.programId)
    )[0].toString();

    const tradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: this.wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: this.candyShop.connection,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(order.programId),
      isEnterprise: this.candyShop.isEnterprise,
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams);
  }
}

class EthBuyer extends Buyer<'Ethereum'> {
  async buy(order: Order): Promise<string> {
    const providers = await this.wallet?.web3Modal.connect();
    return this.candyShop.buy({
      orderUuid: order.txHash,
      providers
    });
  }
}

export const BuyerFactory = ({ blockchain, candyShop, wallet }: ShopProps): Buyer<any> => {
  switch (blockchain) {
    case BlockchainType.Ethereum:
      return new EthBuyer({ candyShop, wallet: wallet as EthWallet });
    default:
      return new SolanaBuyer({ candyShop, wallet: wallet as AnchorWallet });
  }
};
