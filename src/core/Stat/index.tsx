import styled from '@emotion/styled';
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

  const floorPrice = useMemo(() => {
    if (!stat) return 0
    return (stat.floorPrice / LAMPORTS_PER_SOL).toFixed(2)
  }, [stat])

  const totalListed = useMemo(() => {
    if (!stat) return 0
    return stat.totalListed
  }, [stat])

  const totalVolume = useMemo(() => {
    if (!stat) return 0
    return (stat.totalVolume / LAMPORTS_PER_SOL).toFixed(2)
  }, [stat])

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
    <>
    {/* <div className="candy-stat" style={style}>
      <Row align="bottom">
        <Col span={24} md={12}>
          <div className="candy-title">{title}</div>
          <div className="candy-description">{description}</div>
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
    </div> */}

    <Wrap style={style}>
      <div className="candy-shop-container">
        <Flex>
          <Box1>
            <div className="title">{title}</div>
            <div className="description">{description}</div>
          </Box1>
          <Box2>
            <Item>
              <div className="candy-label">FLOOR PRICE</div>
              <div className="statictis">{floorPrice} SOL</div>
            </Item>
            <Item>
              <div className="candy-label">TOTAL LISTED</div>
              <div className="statictis">{totalListed}</div>
            </Item>
            <Item>
              <div className="candy-label">VOLUME</div>
              <div className="statictis">{totalVolume} SOL</div>
            </Item>
          </Box2>
        </Flex>
      </div>
    </Wrap>
    </>
  );
};

const Wrap = styled.div``

const Flex = styled.div`
  display: flex;
  > * {
    width: 50%;
  }

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    > * {
      width: 100%;
    }
    gap: 12px;
  }
`

const Box1 = styled.div`
  .title {
    margin-bottom: 12px;

    font-size: 48px;
    line-height: 58px;
    text-align: left;
    font-weight: bold;

    @media only screen and (max-width: 576px) {
      font-size: 40px;
      line-height: 50px;
    }
  }

  .description {
    text-align: left;
  }
`

const Box2 = styled.div`
  text-align: center;

  align-self: flex-end;
  display: flex;
  > * {
    width: calc(100% / 3);
  }

  @media only screen and (max-width: 768px) {
    align-self: initial;
  }
`

const Item = styled.div`
  &:nth-of-type(2) {
    border-left: 2px solid #e0e0e0;
    border-right: 2px solid #e0e0e0;
  }

  .statictis {
    font-size: 24px;
    font-weight: bold;

    @media only screen and (max-width: 600px) {
      font-size: 16px;
    }
  }
`