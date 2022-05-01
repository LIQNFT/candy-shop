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
  CandyShop as CandyShopResponse,
  SingleBase
} from 'solana-candy-shop-schema/dist';
import {
  CandyShop,
  FetchNFTBatchParam,
  fetchNftsFromWallet,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import { CandyContext } from 'public/Context';
import { useCallback } from 'react';
import { useRef } from 'react';

interface SellProps {
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
  candyShop,
  walletConnectComponent,
  style
}) => {
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [walletPublicKey, setWalletPublicKey] = useState<web3.PublicKey>();
  const [loadingNFTStatus, setNFTLoadingStatus] = useState<LoadStatus>(
    LoadStatus.ToLoad
  );
  const [orderLoading, setOrderLoading] = useState<LoadStatus>(
    LoadStatus.ToLoad
  );
  const [shopLoading, setShopLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shop, setShop] = useState<CandyShopResponse>();

  const { refetch } = useContext(CandyContext);
  // global array for concat batches.
  const allNFTs = useRef<SingleTokenInfo[]>([]);

  useEffect(() => {
    if (!candyShop || !walletPublicKey) return;
    setShopLoading(LoadStatus.Loading);
    candyShop
      .fetchShopByShopId()
      .then((data: SingleBase<CandyShopResponse>) => {
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log('CandyShop: Sell failed to get shop detail, error=', error);
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShop, walletPublicKey]);

  useEffect(() => {
    if (wallet?.publicKey) {
      setWalletPublicKey(wallet.publicKey);
      // refetch fetchNftsFromWallet when get new publicKey
      setNFTLoadingStatus(LoadStatus.ToLoad);
    }
  }, [wallet?.publicKey, refetch]);

  const getShopIdentifiers = useCallback(async (): Promise<string[]> => {
    return candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce(
          (arr: string[], item: WhitelistNft) => arr.concat(item.identifier),
          []
        )
      );
  }, [candyShop]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    console.log(
      'getUserNFTBatchResult: amount of valid batch NFTs=',
      batchNFTs.length
    );
    const userNFTs = allNFTs.current.concat(batchNFTs);
    allNFTs.current = userNFTs;
    setNfts(userNFTs);
  }, []);

  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: web3.PublicKey) => {
      const identifiers = await getShopIdentifiers();
      // Setup the batchCallback to retrieve the batch result.
      const fetchBatchParam: FetchNFTBatchParam = {
        batchCallback: getUserNFTFromBatch,
        batchSize: 8
      };
      const userNFTs = fetchNftsFromWallet(
        candyShop.connection(),
        walletPublicKey,
        identifiers,
        fetchBatchParam
      );
      return userNFTs;
    },
    [candyShop, getShopIdentifiers, getUserNFTFromBatch]
  );

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!walletPublicKey || !candyShop) {
      return;
    }
    if (loadingNFTStatus === LoadStatus.ToLoad) {
      setNFTLoadingStatus(LoadStatus.Loading);
      progressiveLoadUserNFTs(walletPublicKey)
        .then((allUserNFTs: SingleTokenInfo[]) => {
          console.log(
            `getUserNFTs success, total amount of user NFTs= ${allUserNFTs.length}`
          );
        })
        .catch((error: any) => {
          console.log('getUserNFTs failed, error=', error);
        })
        .finally(() => {
          setNFTLoadingStatus(LoadStatus.Loaded);
        });
    }
  }, [candyShop, loadingNFTStatus, walletPublicKey, progressiveLoadUserNFTs]);

  useEffect(() => {
    if (!walletPublicKey || !candyShop) {
      return;
    }
    setOrderLoading(LoadStatus.Loading);
    candyShop
      .activeOrdersByWalletAddress(walletPublicKey.toString())
      .then((sellOrders: OrderSchema[]) => {
        setSellOrders(sellOrders);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.Loaded);
      });
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
    loadingNFTStatus === LoadStatus.ToLoad ||
    orderLoading !== LoadStatus.Loaded ||
    shopLoading !== LoadStatus.Loaded;

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {(loading || nfts.length === 0) && (
          <div className="candy-container-list">
            {Array(4)
              .fill(0)
              .map((_, key) => (
                <div key={key}>
                  <Skeleton />
                </div>
              ))}
          </div>
        )}
        {!loading && shop && (
          <div className="candy-container-list">
            {nfts.map((item) => (
              <div key={item.tokenAccountAddress}>
                <Nft
                  nft={item}
                  candyShop={candyShop}
                  wallet={wallet}
                  sellDetail={hashSellOrders[item.tokenMintAddress]}
                  shop={shop}
                />
              </div>
            ))}
          </div>
        )}
        {loadingNFTStatus === LoadStatus.Loaded && nfts.length === 0 && (
          <Empty description="No NFTs found" />
        )}
      </div>
    </div>
  );
};
