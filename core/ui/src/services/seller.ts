import {
  BlockchainType,
  CandyShopTrade,
  getTokenMetadataByMintAddress,
  NftMetadata,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import { CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { EthWallet, ShopProps } from 'model';
import Handler, { MainProps } from './handler';

export interface SolanaOptionProps {
  shopAddress: string;
  candyShopProgramId?: string;
  baseUnitsPerCurrency: number;
  shopTreasuryMint: string;
  shopCreatorAddress: string;
}

abstract class Seller<T extends keyof typeof BlockchainType> extends Handler<T> {
  constructor(main: MainProps, public shop?: CandyShopResponse) {
    super(main);
    this.shop = shop;
  }

  abstract sell(nft: SingleTokenInfo, price: number, options: SolanaOptionProps | undefined): Promise<string>;

  getTokenMetadataByMintAddress(mintAddress: string, connection: web3.Connection): Promise<NftMetadata> {
    return getTokenMetadataByMintAddress(mintAddress, connection);
  }
}

class SolanaSeller extends Seller<'Solana'> {
  sell(nft: SingleTokenInfo, price: number, options: SolanaOptionProps): Promise<string> {
    const { baseUnitsPerCurrency, shopAddress, shopCreatorAddress, shopTreasuryMint, candyShopProgramId } =
      options as SolanaOptionProps;

    if (!this.wallet) return Promise.reject('Wallet not found');
    if (!candyShopProgramId) return Promise.reject('candyShopProgramId not found');

    const tradeSellParams = {
      connection: this.candyShop.connection,
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
}

class ETHSeller extends Seller<'Ethereum'> {
  async sell(nft: SingleTokenInfo, price: number): Promise<string> {
    if (!this.wallet?.web3Modal || !this.wallet?.publicKey) return Promise.reject('Wallet not found');
    const providers = await this.wallet?.web3Modal.connect();
    return this.candyShop.sell({
      price,
      nft,
      providers
    });
  }
}

interface SellerProps extends ShopProps {
  shop?: CandyShopResponse;
}

export const SellerFactory = ({ blockchain, candyShop, wallet, shop }: SellerProps): Seller<any> => {
  switch (blockchain) {
    case BlockchainType.Ethereum:
      return new ETHSeller({ candyShop, wallet: wallet as EthWallet }, shop);
    default:
      return new SolanaSeller({ candyShop, wallet: wallet as AnchorWallet }, shop);
  }
};
