import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CandyShop } from '../CandyShop';

export interface StatProps {
  candyShop: CandyShop;
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const Stat = ({
  candyShop,
  title,
  description,
  style,
}: StatProps): JSX.Element => {
  const [stat, setStat] = useState<any>([]);

  const floorPrice = useMemo(() => {
    if (!stat) return 0;
    return (stat.floorPrice / LAMPORTS_PER_SOL).toFixed(2);
  }, [stat]);

  const totalListed = useMemo(() => {
    if (!stat) return 0;
    return stat.totalListed;
  }, [stat]);

  const totalVolume = useMemo(() => {
    if (!stat) return 0;
    return (stat.totalVolume / LAMPORTS_PER_SOL).toFixed(2);
  }, [stat]);

  // handle fetch data
  useEffect(() => {
    candyShop
      .stats()
      .then((data: any) => {
        if (!data) return;
        setStat(data);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
  }, [candyShop]);

  return (
    <Wrap style={style}>
      <div className="cds-container">
        <Flex>
          <Box1>
            <div className="title">{title}</div>
            <div className="description">{description}</div>
          </Box1>
          <Box2>
            <Item>
              <div className="candy-label">FLOOR PRICE</div>
              <div className="statistics">{floorPrice} SOL</div>
            </Item>
            <Item>
              <div className="candy-label">TOTAL LISTED</div>
              <div className="statistics">{totalListed}</div>
            </Item>
            <Item>
              <div className="candy-label">VOLUME</div>
              <div className="statistics">{totalVolume} SOL</div>
            </Item>
          </Box2>
        </Flex>
      </div>
    </Wrap>
  );
};

const Wrap = styled.div``;

const Flex = styled.div`
  display: flex;
  > * {
    width: 50%;
  }

  @media ${breakPoints.tabletL} {
    flex-direction: column;
    > * {
      width: 100%;
    }
    gap: 12px;
  }
`;

const Box1 = styled.div`
  .title {
    margin-bottom: 12px;

    font-size: 48px;
    line-height: 58px;
    text-align: left;
    font-weight: bold;

    @media ${breakPoints.tabletS} {
      font-size: 40px;
      line-height: 50px;
      text-align: center;
    }
  }

  .description {
    text-align: left;
  }
`;

const Box2 = styled.div`
  text-align: center;

  align-self: flex-end;
  display: flex;
  > * {
    width: calc(100% / 3);
  }

  @media ${breakPoints.tabletM} {
    align-self: initial;
  }
`;

const Item = styled.div`
  &:nth-of-type(2) {
    border-left: 2px solid #e0e0e0;
    border-right: 2px solid #e0e0e0;
  }

  .statistics {
    font-size: 24px;
    font-weight: bold;

    @media ${breakPoints.tabletM} {
      font-size: 16px;
    }
  }
`;
