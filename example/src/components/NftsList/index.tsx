/**
 * React component that displays a list of orders
 */
import * as React from 'react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Col, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import { singleTokenInfoPromise } from '../../api/fetchMetadata';
import { NFT } from './../../../../.';

const NftsList = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      // Fetch order list
      singleTokenInfoPromise(
        connection,
        '5q1yeHbxChPkDNgG893oeNaiST1K6TXTsVCsoSue2eAC'
      )
        .then((data: any) => {
          setLoading(false);
          setNfts([data]);
        })
        .catch(err => {
          setLoading(false);
          throw err;
        });
    })();
  }, [singleTokenInfoPromise]);

  return (
    <div className="order-list">
      <Row gutter={50}>
        {loading
          ? Array(6)
              .fill(0)
              .map((_, key) => (
                <Col key={key} md={8}>
                  <Skeleton />
                </Col>
              ))
          : nfts.map((item, key) => (
              <Col key={key} md={8}>
                <NFT nft={item} />
              </Col>
            ))}
      </Row>
    </div>
  );
};

export default NftsList;
