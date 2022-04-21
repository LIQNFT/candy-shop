import React, { useContext, useEffect, useMemo, useState } from 'react';
import { web3 } from '@project-serum/anchor';

import { ExplorerLink } from 'components/ExplorerLink';
import { NftAttributes } from 'components/NftAttributes';
import { LiqImage } from 'components/LiqImage';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  candyShop
}) => {
  const [nftInfo, setNftInfo] = useState<Nft>();
  const [loadingNftInfo, setLoadingNftInfo] = useState<boolean>(false);

  const orderPrice = useMemo(() => {
    try {
      return (
        Number(order?.price) / candyShop.baseUnitsPerCurrency
      ).toLocaleString(undefined, {
        minimumFractionDigits: candyShop.priceDecimals,
        maximumFractionDigits: candyShop.priceDecimals
      });
    } catch (err) {
      return null;
    }
  }, [candyShop.baseUnitsPerCurrency, candyShop.priceDecimals, order?.price]);

  useEffect(() => {
    if (order) {
      setLoadingNftInfo(true);
      candyShop
        .nftInfo(order.tokenMint)
        .then((nft) => setNftInfo(nft))
        .catch((err) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, candyShop]);

  return (
    <>
      <div>
        <div className="candy-buy-modal-thumbnail">
          <LiqImage
            src={order?.nftImageLink || ''}
            alt={order?.name}
            fit="contain"
          />
        </div>
      </div>
      <div className="candy-buy-modal-container">
        <div className="candy-title">{order?.name}</div>
        <div className="candy-buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">
              {orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A'}
            </div>
          </div>
          {!walletPublicKey ? (
            walletConnectComponent
          ) : (
            <button
              className="candy-button candy-buy-modal-button"
              onClick={buy}
            >
              Buy Now
            </button>
          )}
        </div>
        {order.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
        )}
        <div className="candy-stat-horizontal">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.tokenMint} />
            </div>
          </div>
          <div className="candy-stat-horizontal-line" />
          {order?.edition ? (
            <>
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
              <div className="candy-stat-horizontal-line" />
            </>
          ) : null}
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.walletAddress} />
            </div>
          </div>
        </div>
        <NftAttributes
          loading={loadingNftInfo}
          attributes={nftInfo?.attributes}
        />
      </div>
    </>
  );
};

export default BuyModalDetail;
