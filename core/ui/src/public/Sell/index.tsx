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
  NftAttribute,
  ShopStatusType
} from '@liqnft/candy-shop-types';
import {
  Blockchain,
  CacheNFTParam,
  CandyShop,
  EthCandyShop,
  FetchNFTBatchParam,
  fetchNftsFromWallet,
  fetchOrdersByShopAndWalletAddress,
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
  const [loadingNFTStatus, setNFTLoadingStatus] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [orderLoading, setOrderLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shopLoading, setShopLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shop, setShop] = useState<CandyShopResponse>();

  // global array for concat batches.
  const allNFTs = useRef<any>({});

  const publicKey = chainProps.wallet?.publicKey.toString();
  const candyShopAddress = chainProps.candyShop.candyShopAddress.toString();

  const sellUpdateStatus = useValidateStatus(SellActionsStatus);
  useUpdateWalletAddress(publicKey);
  useUpdateSubject({
    subject: ShopStatusType.UserNft,
    candyShopAddress: candyShopAddress
  });

  useEffect(() => {
    if (!candyShopAddress) return;
    setShopLoading(LoadStatus.Loading);
    fetchShopByShopAddress(candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        setShop(data.success ? data.result : ({} as CandyShopResponse));
      })
      .catch((error: any) => {
        console.log(`${Logger}: Sell failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShopAddress]);
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
          return new Promise((res) => res({ result: [] }));
      }
    };
    return getAction().then((nfts: ListBase<WhitelistNft>) =>
      nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
    );
  }, [chainProps.blockchain, chainProps.candyShop, shop?.allowSellAnyNft]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    allNFTs.current = Object.assign(
      allNFTs.current,
      batchNFTs.reduce((acc: any, item: SingleTokenInfo) => {
        acc[item.tokenMintAddress] = item;
        return acc;
      }, {})
    );
    setNfts(Object.values(allNFTs.current));
  }, []);

  const fetchEthWalletNFT = useCallback(async () => {
    const options = { method: 'GET', headers: { Accept: 'application/json', 'X-API-Key': 'test' } };

    const LIMIT = 1;
    let cursor = undefined;
    let listNfts: EthNft[] = [];

    while (cursor !== null) {
      let url = `https://deep-index.moralis.io/api/v2/${publicKey}/nft?chain=goerli&format=decimal&limit=${LIMIT}`;

      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      await fetch(url, options)
        .then((response) => response.json())
        .then((response: EthListBase<RawEthNft>) => {
          console.log({ response });
          const nfts = response.result.reduce((acc: EthNft[], token) => {
            if (!token.metadata) return acc;
            const metadata = JSON.parse(token.metadata);
            acc.push({
              ...token,
              attributes: metadata.attributes,
              description: metadata.description,
              nftImage: metadata.image,
              tokenAccountAddress: token.token_hash,
              tokenMintAddress: token.token_hash,
              metadata: {
                data: {
                  name: metadata.name,
                  symbol: metadata.symbol
                }
              }
            });
            return acc;
          }, []);

          cursor = response.cursor;
          listNfts = listNfts.concat(nfts);
        });
    }

    setNfts(listNfts as any as SingleTokenInfo[]);
    setNFTLoadingStatus(LoadStatus.Loaded);
    return listNfts;
  }, [publicKey]);

  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: string) => {
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
              new web3.PublicKey(walletPublicKey),
              identifiers,
              fetchBatchParam,
              cacheNFTParam
            );
          default:
            return fetchEthWalletNFT();
        }
      };
      return getAuction();
    },
    [
      getShopIdentifiers,
      getUserNFTFromBatch,
      enableCacheNFT,
      chainProps.blockchain,
      chainProps.candyShop,
      fetchEthWalletNFT
    ]
  );

  // fetch current wallet nfts when mount and when publicKey was changed.
  // shopLoading !== LoadStatus.Loaded: make sure API fetchShopByShopAddress response first, then handle progressiveLoadUserNFTs function
  // TODO: refactor this function to: fetchShopByShopAddress().then(shop => progressiveLoadUserNFTs(shop)).then()
  useEffect(() => {
    if (!publicKey || shopLoading !== LoadStatus.Loaded) return;
    if (loadingNFTStatus === LoadStatus.ToLoad) {
      allNFTs.current = [];
      setNFTLoadingStatus(LoadStatus.Loading);
      progressiveLoadUserNFTs(publicKey)
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
  }, [loadingNFTStatus, publicKey, progressiveLoadUserNFTs, shopLoading]);

  // get listing NFTs
  useEffect(() => {
    if (!publicKey) return;
    setOrderLoading(LoadStatus.Loading);
    const getAction = (): Promise<any> => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana:
        case Blockchain.Ethereum:
          return fetchOrdersByShopAndWalletAddress(candyShopAddress, publicKey);

        default:
          return new Promise((res) => res([]));
      }
    };
    getAction()
      .then((sellOrders: OrderSchema[]) => {
        if (!Array.isArray(sellOrders)) {
          console.log(`${Logger}: activeOrdersByWalletAddress failed, error=`, sellOrders);
          return;
        }
        setSellOrders(sellOrders);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: activeOrdersByWalletAddress failed, error=`, err);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.Loaded);
      });
  }, [publicKey, sellUpdateStatus, chainProps.blockchain, chainProps.candyShop, candyShopAddress]);

  const hashSellOrders: any = useMemo(() => {
    if (!sellOrders?.length) return {};
    return sellOrders.reduce((acc: any, item: OrderSchema) => {
      acc[item.tokenMint] = item;
      return acc;
    }, {});
  }, [sellOrders]);

  if (!chainProps.wallet?.publicKey) {
    return (
      <div className="candy-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  const loading =
    loadingNFTStatus !== LoadStatus.Loaded || orderLoading !== LoadStatus.Loaded || shopLoading !== LoadStatus.Loaded;

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {loading ? <LoadingSkeleton /> : null}
        {!loading && nfts.length && shop ? (
          <div className="candy-container-list">
            {nfts.map((item) => (
              <div key={item.tokenAccountAddress}>
                <Nft nft={item} sellDetail={hashSellOrders[item.tokenMintAddress]} shop={shop} {...chainProps} />
              </div>
            ))}
          </div>
        ) : null}
        {!loading && nfts.length === 0 && <Empty description="No NFTs found" />}
      </div>
    </div>
  );
};

interface EthListBase<T> {
  status: 'SYNCED' | 'SYNCING';
  total: number;
  page: number;
  page_size: number;
  cursor: string | null;
  result: T[];
}

interface RawEthNft {
  token_address: string;
  token_id: string;
  token_hash: string;
  amount: string;
  owner_of: string;
  name: string;
  symbol: string;
  token_uri: string;
  metadata: string;
}

interface EthNft {
  tokenAccountAddress: string;
  tokenMintAddress: string;
  token_id: string;
  amount: string;
  owner_of: string;
  nftImage: string;
  attributes: NftAttribute[];
  description: string;
  metadata: {
    data: {
      name: string;
      symbol: string;
    };
  };
}
