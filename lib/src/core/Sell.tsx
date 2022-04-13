import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { fetchOrdersByStoreIdAndWalletAddress } from 'api/backend/OrderAPI';
import { SingleTokenInfo } from 'api/fetchMetadata';
import { fetchNftsFromWallet } from 'api/fetchNftsFromWallet';
import { Empty } from 'components/Empty';
import { Nft } from 'components/Nft';
import { Skeleton } from 'components/Skeleton';
import { breakPoints } from 'constant/breakPoints';
import React, { useEffect, useMemo, useState } from 'react';
import { useCallback } from 'react';
import {
  Order as OrderSchema,
  WhitelistNft,
} from 'solana-candy-shop-schema/dist';
import { CandyShop } from './CandyShop';

interface SellProps {
  connection: web3.Connection;
  walletPublicKey?: web3.PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
}

enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded',
}

/**
 * React component that allows user to put an NFT for sale
 */
export const Sell: React.FC<SellProps> = ({
  walletPublicKey,
  connection,
  candyShop,
  walletConnectComponent,
  style,
}) => {
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [loadingStatus, setLoadingStatus] = useState<LoadStatus>(
    LoadStatus.ToLoad
  );

  const fetchWalletNFTs = useCallback(
    (walletPublicKey, connection) => {
      setLoadingStatus(LoadStatus.Loading);
      candyShop
        .shopWlNfts()
        .then((nfts) =>
          nfts.result.reduce(
            (arr: string[], item: WhitelistNft) => arr.concat(item.identifier),
            []
          )
        )
        .then((identifiers: string[]) =>
          identifiers.length === 0
            ? fetchNftsFromWallet(connection, walletPublicKey)
            : fetchNftsFromWallet(connection, walletPublicKey, identifiers)
        )
        .then((userNFTs: SingleTokenInfo[]) => {
          setNfts(userNFTs);
        })
        .finally(() => {
          setLoadingStatus(LoadStatus.Loaded);
        });
    },
    [walletPublicKey]
  );

  const fetchOrders = useCallback(
    (walletPublicKey) => {
      fetchOrdersByStoreIdAndWalletAddress(
        candyShop.candyShopAddress.toString(),
        walletPublicKey.toString()
      ).then((sellOrders) => {
        setSellOrders(sellOrders);
      });
    },
    [walletPublicKey]
  );

  useEffect(() => {
    if (!connection || !walletPublicKey || !candyShop) return;

    if (loadingStatus === LoadStatus.ToLoad) {
      fetchWalletNFTs(walletPublicKey, connection);
      fetchOrders(walletPublicKey);
    }
  }, [connection, walletPublicKey, candyShop]);

  const hashSellOrders: any = useMemo(() => {
    return (
      sellOrders?.reduce((acc: any, item: OrderSchema) => {
        acc[item.tokenMint] = item;
        return acc;
      }, {}) || {}
    );
  }, [sellOrders]);

  if (!walletPublicKey) {
    return (
      <div className="candy-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  return (
    <>
      <Wrap style={style}>
        <div className="candy-container">
          {loadingStatus !== LoadStatus.Loaded ? (
            <Flex>
              {Array(4)
                .fill(0)
                .map((_, key) => (
                  <FlexItem key={key}>
                    <Skeleton />
                  </FlexItem>
                ))}
            </Flex>
          ) : !nfts.length ? (
            <Empty description="No NFTs found" />
          ) : (
            <Flex>
              {nfts.map((item, key) => (
                <FlexItem key={key}>
                  <Nft
                    nft={item}
                    candyShop={candyShop}
                    sellDetail={hashSellOrders[item.tokenMintAddress]}
                  />
                </FlexItem>
              ))}
            </Flex>
          )}
        </div>
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  width: 100%;
`;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 18px;
  column-gap: 18px;
  > * {
    width: calc((100% - 18px * 3) / 4);
  }

  @media ${breakPoints.tabletM} {
    row-gap: 16px;
    column-gap: 16px;
    > * {
      width: 100%;
    }
  }
`;

const FlexItem = styled.div``;
