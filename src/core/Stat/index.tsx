import styled from '@emotion/styled';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { breakPoints } from 'constant/breakPoints';
import { CandyShop } from 'core/CandyShop';
import React, { useEffect, useMemo, useState } from 'react';

interface StatProps {
  candyShop: CandyShop;
  title: string | undefined;
  description: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const Stat = ({ candyShop, title, description, style }: StatProps) => {
  const [stat, setStat] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const floorPrice = useMemo(() => {
    if (!stat) return 0;
    return (Number(stat.floorPrice) / LAMPORTS_PER_SOL).toFixed(2);
  }, [stat]);

  const totalListed = useMemo(() => {
    if (!stat) return 0;
    return stat.totalListed;
  }, [stat]);

  const totalVolume = useMemo(() => {
    if (!stat) return 0;
    return (Number(stat.totalVolume) / LAMPORTS_PER_SOL).toFixed(2);
  }, [stat]);

  // handle fetch data
  useEffect(() => {
    setLoading(true);
    candyShop
      .stats()
      .then((data: any) => {
        if (!data) return;
        setStat(data);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
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

  .statictis {
    font-size: 24px;
    font-weight: bold;

    @media ${breakPoints.tabletM} {
      font-size: 16px;
    }
  }
`;
