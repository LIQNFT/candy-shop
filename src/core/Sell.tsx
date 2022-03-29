import React, { useMemo, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Connection, PublicKey } from '@solana/web3.js';
import { CandyShop } from './CandyShop';
import { SingleTokenInfo } from '../api/fetchMetadata';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { Nft } from '../components/Nft';

import { fetchOrdersByStoreIdAndWalletAddress } from '../api/backend/OrderAPI';
import { fetchNftsFromWallet } from '../api/fetchNftsFromWallet';

import { breakPoints } from '../constant/breakPoints';
import { Skeleton } from 'antd';

interface SellProps {
  connection: Connection;
  walletPublicKey?: PublicKey;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

/**
 * React component that allows user to put an NFT for sale
 */
export const Sell: React.FC<SellProps> = ({
  walletPublicKey,
  connection,
  candyShop,
  walletConnectComponent,
}) => {
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connection && walletPublicKey) {
      (async () => {
        setIsLoading(true);
        const [userNfts, sellOrders] = await Promise.all([
          fetchNftsFromWallet(connection, walletPublicKey),
          fetchOrdersByStoreIdAndWalletAddress(
            candyShop.candyShopAddress().toString(),
            walletPublicKey.toString()
          ),
        ]);
        setNfts(userNfts);
        setSellOrders(sellOrders);
        setIsLoading(false);
      })();
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
      <Container style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, key) => (
              <Col key={key}>
                <Skeleton />
              </Col>
            ))
        ) : !nfts.length ? (
          <Empty>No NFTs found</Empty>
        ) : (
          nfts?.map((item, key) => (
            <Col key={key}>
              <Nft
                nft={item}
                candyShop={candyShop}
                sellDetail={hashSellOrders[item.tokenMintAddress]}
              />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media ${breakPoints.mobile} {
    padding-left: 15px;
    padding-right: 15px;
  }
`;

const Empty = styled.div`
  text-align: center;
  width: 100%;
  padding: 30px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Col = styled.div`
  width: calc(100% / 3 - 12px);
`;
