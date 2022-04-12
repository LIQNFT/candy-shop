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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!connection || !walletPublicKey || !candyShop) return;
    (async () => {
      setIsLoading(true);

      const [userNfts, sellOrders] = await Promise.all([
        candyShop
          .shopWlNfts()
          .then((nfts) =>
            nfts.result.reduce(
              (arr: string[], item: WhitelistNft) =>
                arr.concat(item.identifier),
              []
            )
          )
          .then((identifiers: string[]) =>
            identifiers.length === 0
              ? fetchNftsFromWallet(connection, walletPublicKey)
              : fetchNftsFromWallet(connection, walletPublicKey, identifiers)
          ),
        fetchOrdersByStoreIdAndWalletAddress(
          candyShop.candyShopAddress.toString(),
          walletPublicKey.toString()
        ),
      ]);
      setNfts(userNfts);
      setSellOrders(sellOrders);
      setIsLoading(false);
    })();
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
      <div className="cds-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  return (
    <>
      <Wrap style={style}>
        <div className="cds-container">
          {isLoading ? (
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
  font-family: Helvetica, Arial, sans-serif;
  width: 100%;
`;

const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 12px;
  column-gap: 12px;
  > * {
    width: calc((100% - 12px * 3) / 4);
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