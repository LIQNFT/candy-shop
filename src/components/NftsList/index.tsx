/**
 * React component that displays a list of orders
 */
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Card, Col, Row, Skeleton } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import '../OrderList/style.less';
import { singleTokenInfoPromise } from '../../api/fetchMetadata';
import SellModal from '../SellModal';

const NftsList = () => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [selection, setSelection] = useState();
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(
    (idx: number) => () => {
      setSelection(nfts[idx]);
    },
    [nfts]
  );

  const onClose = useCallback(() => {
    setSelection(undefined);
  }, []);

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
                <Card
                  className="order-item"
                  onClick={onClick(key)}
                  cover={
                    <div className="order-thumbnail">
                      <img
                        src={
                          item?.nftImage || 'https://via.placeholder.com/300'
                        }
                      />
                    </div>
                  }
                >
                  <div>
                    <p className="candy-label">ARTIST_NAME</p>
                    <p>{item?.metadata.data.name}</p>
                  </div>
                  <div>
                    <p className="candy-label">PRICE</p>
                    <p>--</p>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {selection && <SellModal onCancel={onClose} nft={selection} />}
    </div>
  );
};

export default NftsList;
