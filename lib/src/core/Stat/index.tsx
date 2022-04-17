import styled from '@emotion/styled';
import { breakPoints } from 'constant/breakPoints';
import { CandyShop } from '@liqnft/candy-shop-common';
import React, { useEffect, useState } from 'react';

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

  const floorPrice = stat?.floorPrice
    ? (Number(stat.floorPrice) / candyShop.baseUnitsPerCurrency).toLocaleString(
        undefined,
        {
          minimumFractionDigits: candyShop.priceDecimals,
          maximumFractionDigits: candyShop.priceDecimals,
        }
      )
    : null;

  const totalListed = stat?.totalListed
    ? stat.totalListed.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : 0;

  const totalVolume = stat?.totalVolume
    ? (
        Number(stat.totalVolume) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.volumeDecimals,
        maximumFractionDigits: candyShop.volumeDecimals,
      })
    : 0;

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
      <div className="candy-container">
        <Flex>
          <Box1>
            <div className="candy-stat-component-title">{title}</div>
            <div className="candy-stat-component-description">
              {description}
            </div>
          </Box1>
          <Box2>
            <Item>
              <div className="candy-label">FLOOR PRICE</div>
              <div className="candy-value-lg">
                {floorPrice === null
                  ? 'N/A'
                  : `${floorPrice} ${candyShop.currencySymbol}`}
              </div>
            </Item>
            <Item>
              <div className="candy-label">TOTAL LISTED</div>
              <div className="candy-value-lg">{totalListed}</div>
            </Item>
            <Item>
              <div className="candy-label">VOLUME</div>
              <div className="candy-value-lg">
                {totalVolume} {candyShop.currencySymbol}
              </div>
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
  .candy-stat-component-title {
    text-align: left;
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

  .candy-stat-component-description {
    text-align: left;
    font-size: 16px;
    margin-bottom: 15px;
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
    border-left: 1px solid #bdbdbd;
    border-right: 1px solid #bdbdbd;
  }

  .candy-label {
    text-align: center;
  }

  .candy-value-lg {
    text-align: center;
    font-size: 20px;
    font-weight: bold;

    @media ${breakPoints.tabletM} {
      font-size: 16px;
    }
  }
`;
