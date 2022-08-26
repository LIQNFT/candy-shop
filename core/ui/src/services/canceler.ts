import { BlockchainType, CandyShopTrade, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { EthWallet, ShopProps } from 'model';
import Handler from './handler';

abstract class Canceler<T extends keyof typeof BlockchainType> extends Handler<T> {
  abstract cancel(order: OrderSchema): Promise<any>;
}

class SolanaCanceler extends Canceler<'Solana'> {
  cancel(order: OrderSchema): Promise<any> {
    if (!this.wallet?.publicKey) return new Promise((res) => res('Publickey not found'));

    const shopAddress =
      getCandyShopSync(
        new web3.PublicKey(order.candyShopCreatorAddress),
        new web3.PublicKey(order.treasuryMint),
        new web3.PublicKey(order.programId)
      )[0].toString() || '';

    const tradeCancelParams = {
      connection: this.candyShop.connection,
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
}

class EthCanceler extends Canceler<'Ethereum'> {
  async cancel(order: OrderSchema): Promise<any> {
    const providers = await this.wallet?.web3Modal.connect();
    return this.candyShop.cancel({ providers, orderUuid: order.txHash });
  }
}

export const CancelerFactory = ({ blockchain, candyShop, wallet }: ShopProps): Canceler<any> => {
  switch (blockchain) {
    case BlockchainType.Ethereum:
      return new EthCanceler({ candyShop, wallet: wallet as EthWallet });
    default:
      return new SolanaCanceler({ candyShop, wallet: wallet as AnchorWallet });
  }
};
