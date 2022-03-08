import React from 'react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Col, Empty, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import { singleTokenInfoPromise } from '../api/fetchMetadata';
import { Nft } from '../components/Nft';

/**
 * React component that displays a list of orders
 */
export const Sell = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Fetch order list
    singleTokenInfoPromise(
      connection,
      '5q1yeHbxChPkDNgG893oeNaiST1K6TXTsVCsoSue2eAC'
    )
      .then((data: any) => {
        // No data will return
        if (!data) return;

        setNfts([data]);
      })
      .catch(err => {
        console.info('singleTokenInfoPromise failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [singleTokenInfoPromise]);

  return (
    <div className="candy-shop-list">
      <Row gutter={[
        { md: 24, xs: 16 },
        { md: 24, xs: 16 }
      ]}>
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, key) => (
              <Col key={key} md={8} xs={24}>
                <Skeleton />
              </Col>
            ))
        ) : !nfts.length ? (
          <Col span={24}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Col>
        ) : (
          nfts
            .filter(item => !!item)
            .map((item, key) => (
              <Col key={key} md={8} xs={24}>
                <Nft nft={item} />
              </Col>
            ))
        )}
      </Row>
    </div>
  );
};
