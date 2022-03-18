import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Col, Row, Statistic } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { CandyShop } from '../CandyShop';

import './style.less';

interface StatProps {
  candyShop: CandyShop;
  title: string|undefined;
  description: string|undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const Stat = ({
  candyShop,
  title,
  description,
  style,
}: StatProps) => {
  const [stat, setStat] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  // handle window size change
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  let isMobile: boolean = width <= 600;

  // handle fetch data
  useEffect(() => {
    setLoading(true);
    candyShop
      .stats()
      .then((data: any) => {
        if (!data) return;

        setStat(data);
      })
      .catch(err => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [candyShop]);

  return (
    <div className="candy-stat" style={style}>
      <Row align="bottom">
        <Col span={24} md={12}>
          <div className="candy-title">{title}</div>
          <p>{description}</p>
        </Col>
        <Col span={24} md={12} className="candy-stat-container">
          <Row justify="center" gutter={18}>
            <Col span={8}>
              <div className="candy-label">FLOOR PRICE</div>
              <Statistic
                suffix="SOL"
                value={(stat?.floorPrice as any) / LAMPORTS_PER_SOL}
                precision={2}
                valueStyle={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold' }}
              />
            </Col>
            <Col span={8}>
              <div className="candy-label">TOTAL LISTED</div>
              <Statistic
                value={stat?.totalListed as any}
                valueStyle={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold' }}
              />
            </Col>
            <Col span={8}>
              <div className="candy-label">VOLUME</div>
              <Statistic
                suffix="SOL"
                value={(stat?.totalVolume as any) / LAMPORTS_PER_SOL}
                precision={2}
                valueStyle={{ fontSize: isMobile ? 16 : 24, fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
