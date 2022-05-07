import React, { useEffect, useState } from 'react';
import { web3 } from '@project-serum/anchor';

import { LiqImage } from 'components/LiqImage';
import { NftStat } from 'components/NftStat';
// import { NftAttributes } from 'components/NftAttributes';

import { Auction, AuctionBid, SingleBase } from '@liqnft/candy-shop-types';
import { CandyShop, fetchAuctionBidAPI } from '@liqnft/candy-shop-sdk';
import dayjs from 'dayjs';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';

export interface AuctionModalDetailProps {
  order: Auction;
  buy: (price: number) => void;
  buyNow: () => void;
  withdraw: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

const getPrice = (candyShop: CandyShop, price?: string | null) => {
  if (!price || isNaN(Number(price))) return null;

  return (Number(price) / candyShop.baseUnitsPerCurrency).toLocaleString(undefined, {
    minimumFractionDigits: candyShop.priceDecimalsMin,
    maximumFractionDigits: candyShop.priceDecimals
  });
};

export const AuctionModalDetail: React.FC<AuctionModalDetailProps> = ({
  order,
  buy,
  buyNow,
  withdraw,
  walletPublicKey,
  walletConnectComponent,
  candyShop
}) => {
  // const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  // const [nftInfo, setNftInfo] = useState<Nft | null>(null);
  const [bidInfo, setBidInfo] = useState<AuctionBid | null>(null);

  useEffect(() => {
    if (!walletPublicKey) return;

    fetchAuctionBidAPI(order.auctionAddress, walletPublicKey.toString())
      .then((res: SingleBase<AuctionBid>) => {
        if (!res.success) return;
        setBidInfo(res.result);
        console.log(res);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, [order, walletPublicKey]);

  const [countdown] = useState<number>(() => {
    const second = Math.floor(Number(order.startTime) + Number(order.biddingPeriod) - dayjs().unix());
    return dayjs().add(second, 'second').unix();
  });
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
    setPrice(e.target.value);
  };

  const isEnableBuyNow = Boolean(order.buyNowPrice);
  const buyNowPrice = getPrice(candyShop, order.buyNowPrice);
  const buyNowPriceContent = buyNowPrice ? `${buyNowPrice} ${candyShop.currencySymbol}` : 'N/A';
  const highestBidPrice = getPrice(candyShop, order.highestBidPrice) || getPrice(candyShop, order.startingBid);
  const highestBidPriceContent = highestBidPrice ? `${highestBidPrice} ${candyShop.currencySymbol}` : 'N/A';

  const PlaceBidButton = walletPublicKey ? (
    <button
      disabled={Boolean(!price)}
      className={`candy-button ${isEnableBuyNow ? 'candy-button-ghost' : ''}`}
      onClick={() => price && buy(Number(price))}
    >
      Place Bid
    </button>
  ) : (
    walletConnectComponent
  );

  const ModalDetailContent = () => {
    if (!bidInfo) return null;

    if (order.highestBidBuyer === walletPublicKey?.toString()) {
      return <div className="candy-auction-modal-notice">Congratulations, you are currently the highest bidder!</div>;
    }

    if (bidInfo.status === 0) {
      return (
        <div className="candy-auction-modal-notice">
          You have been outbid! Retrieve your funds here or place a higher bid below.
          <button className="candy-button candy-button-ghost" style={{ marginLeft: 5 }} onClick={withdraw}>
            Retrieve Funds
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="candy-auction-modal-detail">
      {ModalDetailContent()}

      <div className="candy-auction-modal-detail-container">
        <div className="candy-auction-modal-thumbnail">
          <LiqImage src={order?.image || ''} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-auction-modal-container">
          <div className="candy-auction-modal-countdown">
            AUCTION ENDS IN <span ref={setCountDownRef}>00:00:00</span>
          </div>

          <div className="candy-title">{order?.name}</div>

          {isEnableBuyNow && (
            <div className="candy-auction-modal-buy-now">
              <div>
                <div className="candy-label">BUY NOW PRICE</div>
                <div className="candy-price">{buyNowPriceContent}</div>
              </div>
              <button className="candy-button" onClick={buyNow}>
                Buy Now
              </button>
            </div>
          )}

          <div className="candy-auction-modal-form-item">
            <div className="candy-label">CURRENT BID</div>
            <div className="candy-price">{highestBidPriceContent}</div>
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

          <div className="candy-auction-modal-prompt">Place bid of {highestBidPriceContent} or more</div>

          {order.description && (
            <div className="candy-stat">
              <div className="candy-label">DESCRIPTION</div>
              <div className="candy-value">{order?.description}</div>
            </div>
          )}

          <NftStat owner={order.sellerAddress} tokenMint={order.tokenMint} edition={1} />
          {/* <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} /> */}
        </div>
      </div>
    </div>
  );
};

const get2NumberTime = (val: number) => (val > 9 ? val : '0' + val);
