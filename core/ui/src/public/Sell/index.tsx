import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
} from '@liqnft/candy-shop-types';
import {
  CacheNFTParam,
  CandyShop,
  FetchNFTBatchParam,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';

import { LoadStatus, SellActionsStatus } from 'constant';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateCandyShopContext } from 'public/Context';

const Logger = 'CandyShopUI/Sell';

interface SellProps {
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
  style?: { [key: string]: string | number } | undefined;
  enableCacheNFT?: boolean;
}

/**
 * React component that allows user to put wallet's NFT for sale
 */
export const Sell: React.FC<SellProps> = ({ wallet, walletConnectComponent, style, candyShop, enableCacheNFT }) => {
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [walletPublicKey, setWalletPublicKey] = useState<web3.PublicKey>();
  const [loadingNFTStatus, setNFTLoadingStatus] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [orderLoading, setOrderLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shopLoading, setShopLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shop, setShop] = useState<CandyShopResponse>();

  // global array for concat batches.
  const allNFTs = useRef<any>({});
  const firstBatchNFTLoaded = useRef<boolean>(false);

  const sellUpdateStatus = useValidateStatus(SellActionsStatus);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

  useEffect(() => {
    if (!walletPublicKey) return;
    setShopLoading(LoadStatus.Loading);
    fetchShopByShopAddress(candyShop.candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: Sell failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShop, walletPublicKey]);

  useEffect(() => {
    if (wallet?.publicKey && candyShop) {
      setWalletPublicKey(wallet.publicKey);
      setNFTLoadingStatus(LoadStatus.ToLoad);
    }
  }, [wallet?.publicKey, sellUpdateStatus, candyShop]);

  const getShopIdentifiers = useCallback(async (): Promise<string[]> => {
    return candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
      );
  }, [candyShop]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    if (!firstBatchNFTLoaded.current) {
      firstBatchNFTLoaded.current = true;
    }
    allNFTs.current = Object.assign(
      allNFTs.current,
      batchNFTs.reduce((acc: any, item: SingleTokenInfo) => {
        acc[item.tokenMintAddress] = item;
        return acc;
      }, {})
    );
    // const userNFTs = allNFTs.current.concat(batchNFTs);
    // allNFTs.current = userNFTs;
    setNfts(Object.values(allNFTs.current));
  }, []);

  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: web3.PublicKey) => {
      const identifiers = await getShopIdentifiers();
      // Setup the batchCallback to retrieve the batch result.
      const fetchBatchParam: FetchNFTBatchParam = {
        batchCallback: getUserNFTFromBatch,
        batchSize: 8
      };
      // Enable cache nft, store nft token in IDB and get nft token from IDB.
      // CandyShopSDK will always keep up-to-date status from chain in IDB once fetchNFT is called.
      const cacheNFTParam: CacheNFTParam = {
        enable: enableCacheNFT ?? false
      };
      const userNFTs = fetchNftsFromWallet(
        candyShop.connection(),
        walletPublicKey,
        identifiers,
        fetchBatchParam,
        cacheNFTParam
      );
      return userNFTs;
    },
    [candyShop, getShopIdentifiers, getUserNFTFromBatch, enableCacheNFT]
  );

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    if (loadingNFTStatus === LoadStatus.ToLoad) {
      allNFTs.current = [];
      firstBatchNFTLoaded.current = false;
      setNFTLoadingStatus(LoadStatus.Loading);
      progressiveLoadUserNFTs(walletPublicKey)
        .then((allUserNFTs: SingleTokenInfo[]) => {
          console.log(`${Logger}: getUserNFTs success, total amount of user NFTs= ${allUserNFTs.length}`);
        })
        .catch((error: any) => {
          console.log(`${Logger}: getUserNFTs failed, error=`, error);
        })
        .finally(() => {
          setNFTLoadingStatus(LoadStatus.Loaded);
        });
    }
  }, [candyShop, loadingNFTStatus, walletPublicKey, progressiveLoadUserNFTs]);

  useEffect(() => {
    if (!walletPublicKey) {
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
  }, [candyShop, walletPublicKey, sellUpdateStatus]);

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
    !firstBatchNFTLoaded.current || orderLoading !== LoadStatus.Loaded || shopLoading !== LoadStatus.Loaded;

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {loading && (
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
        {!loading && (
          <>
            {nfts.length > 0 && shop && (
              <div className="candy-container-list">
                {nfts.map((item) => (
                  <div key={item.tokenAccountAddress}>
                    <Nft
                      nft={item}
                      wallet={wallet}
                      sellDetail={hashSellOrders[item.tokenMintAddress]}
                      shop={shop}
                      candyShop={candyShop}
                    />
                  </div>
                ))}
              </div>
            )}
            {nfts.length === 0 && <Empty description="No NFTs found" />}
          </>
        )}
      </div>
    </div>
  );
};
