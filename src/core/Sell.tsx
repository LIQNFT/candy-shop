import React from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Col, Empty, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { fetchNftsFromWallet } from '../api/fetchNftsFromWallet';
import { Nft } from '../components/Nft';
import { CandyShop } from './CandyShop';
import { SingleTokenInfo } from '../api/fetchMetadata';

interface SellProps {
  connection: Connection;
  walletPublicKey: PublicKey;
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
  console.log('Sell initialized for store id', candyShop.candyShopAddress);

  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && connection && walletPublicKey) {
      (async () => {
        setIsLoading(true);
        let userNfts = await fetchNftsFromWallet(connection, walletPublicKey);
        setNfts(userNfts);
        setIsLoading(false);
      })();
    }
  }, [connection, walletPublicKey]);

  console.log('SELL TEST', walletConnectComponent);

  if (!walletPublicKey) {
    return (
      <div className="candy-shop-list" style={{textAlign: 'center'}}>
        {walletConnectComponent}
      </div>
    )
  }

  return (
    <div className="candy-shop-list">
      <Row gutter={[
        { md: 24, xs: 16 },
        { md: 24, xs: 16 }
      ]}>
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, key) => (
              <Col key={key} md={8} xs={24}>
                <Skeleton />
              </Col>
            ))
        ) : !nfts.length ? (
          <Col span={24}>
            <Empty description='No NFTs found' />
          </Col>
        ) : (
          nfts?.map((item, key) => (
            <Col key={key} md={8} xs={24}>
              <Nft nft={item} candyShop={candyShop} />
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};
