import React, { useContext, useEffect, useMemo, useState } from 'react';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Empty } from 'components/Empty';
import { Nft } from 'components/Nft';
import { Skeleton } from 'components/Skeleton';

import {
  Order as OrderSchema,
  WhitelistNft,
  ListBase,
  CandyShop as CandyShopResponse
} from 'solana-candy-shop-schema/dist';
import {
  CandyShop,
  fetchNftsFromWallet,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import { CandyContext } from 'public/Context';

interface SellProps {
  connection: web3.Connection;
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
}

enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded'
}

/**
 * React component that allows user to put an NFT for sale
 */

export const Sell: React.FC<SellProps> = ({
  wallet,
  connection,
  candyShop,
  walletConnectComponent,
  style
}) => {
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [walletPublicKey, setWalletPublicKey] = useState<web3.PublicKey>();
  const [loadingStatus, setLoadingStatus] = useState<LoadStatus>(
    LoadStatus.ToLoad
  );
  const [orderLoading, setOrderLoading] = useState<LoadStatus>(
    LoadStatus.ToLoad
  );
  const [shopLoading, setShopLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shop, setShop] = useState<CandyShopResponse>();

  const { refetch } = useContext(CandyContext);

  // get fee
  useEffect(() => {
    if (!candyShop || !walletPublicKey) return;
    setShopLoading(LoadStatus.Loading);
    candyShop
      .fetchShopByWalletAddress()
      .then(({ result }: ListBase<CandyShopResponse>) => {
        setShop(
          result.find((item) => {
            return (
              item.candyShopAddress === candyShop.candyShopAddress.toString()
            );
          })
        );
      })
      .catch(() => {
        console.log('ERROR get shop detail.');
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShop, walletPublicKey]);

  // get publicKey
  useEffect(() => {
    if (wallet?.publicKey) {
      setWalletPublicKey(wallet.publicKey);
      setLoadingStatus(LoadStatus.ToLoad); // refetch fetchNftsFromWallet when get new publicKey
    }
    // refetch: get list when buy/sell/cancel nft
  }, [wallet?.publicKey, refetch]);

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!connection || !walletPublicKey || !candyShop) return;
    if (loadingStatus !== LoadStatus.ToLoad) return;

    setLoadingStatus(LoadStatus.Loading);
    candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce(
          (arr: string[], item: WhitelistNft) => arr.concat(item.identifier),
          []
        )
      )
      .then((identifiers: string[]) => {
        console.log(
          `Sell: shop ${candyShop.candyShopAddress} identifiers ${identifiers}`
        );
        return fetchNftsFromWallet(connection, walletPublicKey, identifiers);
      })
      .then((userNFTs: SingleTokenInfo[]) => {
        setNfts(userNFTs);
      })
      .finally(() => {
        setLoadingStatus(LoadStatus.Loaded);
      });
  }, [candyShop, connection, loadingStatus, walletPublicKey]);

  // fetch list orders
  useEffect(() => {
    if (!walletPublicKey || !candyShop) return;

    setOrderLoading(LoadStatus.Loading);
    candyShop
      .activeOrdersByWalletAddress(walletPublicKey.toString())
      .then((sellOrders: OrderSchema[]) => {
        setSellOrders(sellOrders);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.Loaded);
      });
    // refetch: get list when buy/sell/cancel nft
  }, [candyShop, walletPublicKey, refetch]);

  const hashSellOrders: any = useMemo(() => {
    return (
      sellOrders?.reduce((acc: any, item: OrderSchema) => {
        acc[item.tokenMint] = item;
        return acc;
      }, {}) || {}
    );
  }, [sellOrders]);

  if (!wallet) {
    return (
      <div className="candy-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  const loading =
    loadingStatus !== LoadStatus.Loaded ||
    orderLoading !== LoadStatus.Loaded ||
    shopLoading !== LoadStatus.Loaded;

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {loading ? (
          <div className="candy-container-list">
            {Array(4)
              .fill(0)
              .map((_, key) => (
                <div key={key}>
                  <Skeleton />
                </div>
              ))}
          </div>
        ) : nfts.length && shop ? (
          <div className="candy-container-list">
            {nfts.map((item) => (
              <div key={item.tokenAccountAddress}>
                <Nft
                  nft={item}
                  candyShop={candyShop}
                  wallet={wallet}
                  sellDetail={hashSellOrders[item.tokenMintAddress]}
                  shop={shop}
                  connection={connection}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No NFTs found" />
        )}
      </div>
    </div>
  );
};
