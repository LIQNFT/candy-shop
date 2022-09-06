import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Empty } from 'components/Empty';
import { Nft } from 'components/Nft';
import { LoadingSkeleton } from 'components/LoadingSkeleton';

import {
  Order as OrderSchema,
  WhitelistNft,
  ListBase,
  CandyShop as CandyShopResponse,
  SingleBase,
  ShopStatusType
} from '@liqnft/candy-shop-types';
import {
  Blockchain,
  CacheNFTParam,
  CandyShop,
  EthCandyShop,
  FetchNFTBatchParam,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';

import { LoadStatus, SellActionsStatus } from 'constant';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateSubject, useUpdateWalletAddress } from 'public/Context/CandyShopDataValidator';
import { CommonChain, EthWallet } from '../../model';

const Logger = 'CandyShopUI/Sell';

interface SellType<C, S, W> extends CommonChain<C, S, W> {
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
  enableCacheNFT?: boolean;
}
type SellProps =
  | SellType<Blockchain.Solana, CandyShop, AnchorWallet>
  | SellType<Blockchain.Ethereum, EthCandyShop, EthWallet>;

/**
 * React component that allows user to put wallet's NFT for sale
 */
export const Sell: React.FC<SellProps> = ({ walletConnectComponent, style, enableCacheNFT, ...chainProps }) => {
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

  const publicKey = chainProps.wallet?.publicKey.toString();
  const candyShopAddress = chainProps.candyShop.candyShopAddress.toString();

  const sellUpdateStatus = useValidateStatus(SellActionsStatus);
  useUpdateWalletAddress(publicKey);
  useUpdateSubject({
    subject: ShopStatusType.UserNft,
    candyShopAddress: candyShopAddress
  });

  useEffect(() => {
    if (!walletPublicKey) return;
    setShopLoading(LoadStatus.Loading);
    fetchShopByShopAddress(candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: Sell failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShopAddress, walletPublicKey]);

  useEffect(() => {
    if (chainProps.wallet?.publicKey && candyShopAddress) {
      if (chainProps.blockchain === Blockchain.Solana) {
        setWalletPublicKey(chainProps.wallet.publicKey);
      }
      setNFTLoadingStatus(LoadStatus.ToLoad);
    }
  }, [candyShopAddress, chainProps.blockchain, chainProps.candyShop, chainProps.wallet?.publicKey, sellUpdateStatus]);

  /**
   * getShopIdentifiers values:
   * undefined: that shop allow to sell any NFTs
   * []: that shop only allow to sell whitelisted NFTs and has empty whitelisted Identifiers
   * */
  const getShopIdentifiers = useCallback(async (): Promise<string[] | undefined> => {
    if (shop?.allowSellAnyNft !== 0) return undefined;
    const getAction = (): Promise<any> => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana:
          return chainProps.candyShop.shopWlNfts();
        default:
          return new Promise((res) => res(''));
      }
    };
    return getAction().then((nfts: ListBase<WhitelistNft>) =>
      nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
    );
  }, [chainProps.blockchain, chainProps.candyShop, shop?.allowSellAnyNft]);

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
      const getAuction = (): Promise<any> => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana:
            return fetchNftsFromWallet(
              chainProps.candyShop.connection(),
              walletPublicKey,
              identifiers,
              fetchBatchParam,
              cacheNFTParam
            );
          default:
            return new Promise((res) => res(''));
        }
      };
      return getAuction();
    },
    [getShopIdentifiers, getUserNFTFromBatch, enableCacheNFT, chainProps.blockchain, chainProps.candyShop]
  );

  // fetch current wallet nfts when mount and when publicKey was changed.
  // shopLoading !== LoadStatus.Loaded: make sure API fetchShopByShopAddress response first, then handle progressiveLoadUserNFTs function
  // TODO: refactor this function to: fetchShopByShopAddress().then(shop => progressiveLoadUserNFTs(shop)).then()
  useEffect(() => {
    if (!walletPublicKey || shopLoading !== LoadStatus.Loaded) {
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
          firstBatchNFTLoaded.current = true;
        })
        .finally(() => {
          setNFTLoadingStatus(LoadStatus.Loaded);
        });
    }
  }, [loadingNFTStatus, walletPublicKey, progressiveLoadUserNFTs, shopLoading]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    setOrderLoading(LoadStatus.Loading);
    const getAction = (): Promise<any> => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana:
          return chainProps.candyShop.activeOrdersByWalletAddress(walletPublicKey.toString());

        default:
          return new Promise((res) => res(''));
      }
    };
    getAction()
      .then((sellOrders: OrderSchema[]) => {
        setSellOrders(sellOrders);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: activeOrdersByWalletAddress failed, error=`, err);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.Loaded);
      });
  }, [walletPublicKey, sellUpdateStatus, chainProps.blockchain, chainProps.candyShop]);

  const hashSellOrders: any = useMemo(() => {
    return (
      sellOrders?.reduce((acc: any, item: OrderSchema) => {
        acc[item.tokenMint] = item;
        return acc;
      }, {}) || {}
    );
  }, [sellOrders]);

  if (!chainProps.wallet) {
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
        {loading && <LoadingSkeleton />}
        {!loading && (
          <>
            {nfts.length > 0 && shop && (
              <div className="candy-container-list">
                {nfts.map((item) => (
                  <div key={item.tokenAccountAddress}>
                    <Nft nft={item} sellDetail={hashSellOrders[item.tokenMintAddress]} shop={shop} {...chainProps} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {loadingNFTStatus === LoadStatus.Loaded && nfts.length === 0 && <Empty description="No NFTs found" />}
      </div>
    </div>
  );
};
