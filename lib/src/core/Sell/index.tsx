import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Empty } from 'components/Empty';
import { Nft } from 'components/Nft';
import { Skeleton } from 'components/Skeleton';
import { breakPoints } from 'constant/breakPoints';

import {
  Order as OrderSchema,
  WhitelistNft,
} from 'solana-candy-shop-schema/dist';
import {
  CandyShop,
  fetchNftsFromWallet,
  SingleTokenInfo,
} from '@liqnft/candy-shop-sdk';

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
  Loaded = 'Loaded',
}

/**
 * React component that allows user to put an NFT for sale
 */
export const Sell: React.FC<SellProps> = ({
  wallet,
  connection,
  candyShop,
  walletConnectComponent,
  style,
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

  useEffect(() => {
    if (wallet?.publicKey) {
      setWalletPublicKey(wallet.publicKey);
      setLoadingStatus(LoadStatus.ToLoad); // refetch fetchNftsFromWallet when get new publicKey
    }
  }, [wallet?.publicKey]);

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!connection || !walletPublicKey || !candyShop) return;
    if (loadingStatus !== LoadStatus.ToLoad) return;

    setLoadingStatus(LoadStatus.Loading);
    candyShop
      .shopWlNfts()
      .then((nfts) =>
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
      .then((sellOrders) => {
        setSellOrders(sellOrders);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.ToLoad);
      });
  }, [candyShop, walletPublicKey]);

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

  return (
    <Wrap style={style}>
      <div className="candy-container">
        {loadingStatus !== LoadStatus.Loaded ||
        orderLoading === LoadStatus.Loading ? (
          <Flex>
            {Array(4)
              .fill(0)
              .map((_, key) => (
                <FlexItem key={key}>
                  <Skeleton />
                </FlexItem>
              ))}
          </Flex>
        ) : nfts.length ? (
          <Flex>
            {nfts.map((item) => (
              <FlexItem key={item.tokenAccountAddress}>
                <Nft
                  nft={item}
                  candyShop={candyShop}
                  wallet={wallet}
                  sellDetail={hashSellOrders[item.tokenMintAddress]}
                />
              </FlexItem>
            ))}
          </Flex>
        ) : (
          <Empty description="No NFTs found" />
        )}
      </div>
    </Wrap>
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
