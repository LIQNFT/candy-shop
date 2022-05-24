import React, { useEffect, useState } from 'react';
import { web3 } from '@project-serum/anchor';

import { LiqImage } from 'components/LiqImage';
import { NftStat } from 'components/NftStat';
// import { NftAttributes } from 'components/NftAttributes';

import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import dayjs from 'dayjs';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';

export interface AuctionModalDetailProps {
  order: OrderSchema;
  buy: (price: number) => void;
  buyNow: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

const getPrice = (candyShop: CandyShop, order: OrderSchema) => {
  if (!order?.price) return null;

  return (Number(order?.price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const AuctionModalDetail: React.FC<AuctionModalDetailProps> = ({
  order,
  buy,
  buyNow,
  walletPublicKey,
  walletConnectComponent,
  candyShop
}) => {
  // const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  // const [nftInfo, setNftInfo] = useState<Nft | null>(null);
  const [countdown] = useState<number>(dayjs().add(24, 'hour').unix());
  const [countDownRef, setCountDownRef] = useState<HTMLSpanElement | null>();
  const [price, setPrice] = useState<number>();

  const timeoutRef = useUnmountTimeout();

  // useEffect(() => {
  //   setLoadingNftInfo(true);
  //   candyShop
  //     .nftInfo(order.tokenMint)
  //     .then((nft) => setNftInfo(nft))
  //     .catch((err) => {
  //       console.info('fetchNftByMint failed:', err);
  //     })
  //     .finally(() => {
  //       setLoadingNftInfo(false);
  //     });
  // }, [order.tokenMint, candyShop]);

  useEffect(() => {
    if (!countDownRef || !countdown) return;
    if (dayjs.unix(countdown) <= dayjs()) return;

    const getRetainCountdown = () => {
      const NOW = dayjs().unix();
      const t = countdown - NOW;
      const hours = Math.floor(t / 3600);
      const minutes = Math.floor((t - hours * 3600) / 60);
      const seconds = t - hours * 3600 - minutes * 60;
      countDownRef.innerText = ` ${get2NumberTime(hours)}:${get2NumberTime(minutes)}:${get2NumberTime(seconds)}`;

      timeoutRef.current = setTimeout(getRetainCountdown, 1000);
    };
    getRetainCountdown();
  }, [countDownRef, countdown, timeoutRef]);

  const onChangeInput = (e: any) => {
    if (orderPrice && e.target.value <= orderPrice) {
      return setPrice(Number(orderPrice));
    }

    setPrice(e.target.value);
  };

  const orderPrice = getPrice(candyShop, order);
  const priceContent = orderPrice ? `${orderPrice} ${candyShop.currencySymbol}` : 'N/A';
  const isEnableBuyNow = true;

  const PlaceBidButton = walletPublicKey ? (
    <button
      disabled={Boolean(!price)}
      className={`candy-button ${isEnableBuyNow ? 'candy-button-ghost' : ''}`}
      onClick={() => price && buy(price)}
    >
      Place Bid
    </button>
  ) : (
    walletConnectComponent
  );

  return (
    <div className="candy-auction-modal-detail">
      <div className="candy-auction-modal-notice">Congratulations, you are currently the highest bidder!</div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="candy-auction-modal-thumbnail">
          <LiqImage src={order?.nftImageLink || ''} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-auction-modal-container">
          <div className="candy-auction-modal-countdown">
            AUCTION ENDS IN
            <span ref={setCountDownRef}>00:00:00</span>
          </div>

          <div className="candy-title">{order?.name}</div>

          {isEnableBuyNow && (
            <div className="candy-auction-modal-buy-now">
              <div>
                <div className="candy-label">BUY NOW PRICE</div>
                <div className="candy-price">{priceContent}</div>
              </div>
              <button className="candy-button" onClick={buyNow}>
                Buy Now
              </button>
            </div>
          )}
          <div className="candy-auction-modal-form-item">
            <div className="candy-label">CURRENT BID</div>
            <div className="candy-price">{priceContent}</div>
          </div>
          <div className="candy-auction-modal-control">
            <div>
              <div className="candy-input-label">Enter your bid</div>
              <div className="candy-input-price">
                <input
                  placeholder="0"
                  min={0}
                  onChange={onChangeInput}
                  type="number"
                  value={price === undefined ? '' : price}
                />
                <span>{candyShop?.currencySymbol}</span>
              </div>
            </div>
            {PlaceBidButton}
          </div>
          <div className="candy-auction-modal-prompt">Place bid of {priceContent} or more</div>

          {order.nftDescription && (
            <div className="candy-stat">
              <div className="candy-label">DESCRIPTION</div>
              <div className="candy-value">{order?.nftDescription}</div>
            </div>
          )}
          <NftStat owner={order.walletAddress} tokenMint={order.tokenMint} edition={order.edition} />
          {/* <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} /> */}
        </div>
      </div>
    </div>
  );
};

const get2NumberTime = (val: number) => (val > 9 ? val : '0' + val);
