import React, { useEffect, useState } from 'react';
import { web3 } from '@project-serum/anchor';

import { LiqImage } from 'components/LiqImage';
import { NftStat } from 'components/NftStat';
import { NftAttributes } from 'components/NftAttributes';
import { ExplorerLink } from 'components/ExplorerLink';
import { Countdown } from 'components/Countdown';
import { Price } from 'components/Price';

import { Auction, AuctionBid, SingleBase, AuctionStatus, BidStatus } from '@liqnft/candy-shop-types';
import { CandyShop, fetchAuctionBidByWalletAddress } from '@liqnft/candy-shop-sdk';

const Logger = 'CandyShopUI/AuctionModalDetail';
export interface AuctionModalDetailProps {
  auction: Auction;
  placeBid: (price: number) => void;
  buyNow: () => void;
  onWithdrew: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

export const AuctionModalDetail: React.FC<AuctionModalDetailProps> = ({
  auction,
  placeBid,
  buyNow,
  onWithdrew,
  walletPublicKey,
  walletConnectComponent,
  candyShop
}) => {
  const [bidInfo, setBidInfo] = useState<AuctionBid | null>(null);
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!walletPublicKey) return;

    fetchAuctionBidByWalletAddress(auction.auctionAddress, walletPublicKey.toString())
      .then((res: SingleBase<AuctionBid>) => {
        if (res.success) {
          setBidInfo(res.result);
          console.log(`${Logger}: fetchAuctionBidByWalletAddress success=`, res.result);
          console.log(`${Logger}: fetchAuctionBidAPI BidStatus=`, mappedBidStatusString(res.result.status));
        } else {
          console.log(`${Logger}: fetchAuctionBidAPI failed, ${walletPublicKey.toString()} has not placed any bid yet`);
        }
      })
      .catch((error: any) => {
        console.log(`${Logger}: fetchAuctionBidAPI failed, error=`, error);
      });
  }, [auction, walletPublicKey]);

  const isEnableBuyNow = Boolean(auction.buyNowPrice);

  const minNextBid = auction.highestBidPrice
    ? Number(auction.highestBidPrice) + Number(auction.tickSize)
    : Number(auction.startingBid);
  const acceptNextBid = !isEnableBuyNow || (isEnableBuyNow && minNextBid < Number(auction.buyNowPrice));

  const PlaceBidButton = walletPublicKey ? (
    <button disabled={Boolean(!price)} className="candy-button" onClick={() => price && placeBid(Number(price))}>
      Place Bid
    </button>
  ) : (
    walletConnectComponent
  );

  const ModalAlertElement = () => {
    if (!bidInfo) return null;

    if (
      auction.highestBidBuyer &&
      auction.highestBidBuyer === walletPublicKey?.toString() &&
      bidInfo.status !== BidStatus.WON
    ) {
      return <div className="candy-auction-modal-notice">Congratulations, you are currently the highest bidder!</div>;
    }

    if (
      auction.highestBidBuyer &&
      auction.highestBidBuyer === walletPublicKey?.toString() &&
      bidInfo.status === BidStatus.WON
    ) {
      return <div className="candy-auction-modal-notice">Congratulations, you have won the auction!</div>;
    }

    if (bidInfo.status !== BidStatus.WITHDRAWN) {
      return (
        <div className="candy-auction-modal-notice">
          <button className="candy-button candy-button-outlined" style={{ marginRight: 15 }} onClick={onWithdrew}>
            Retrieve Funds
          </button>
          {auction.status === AuctionStatus.STARTED
            ? 'You have been outbid! Retrieve your funds here or place a higher bid below.'
            : 'You have been outbid! Retrieve your funds here'}
        </div>
      );
    }

    return null;
  };

  const mappedBidStatusString = (bidStatus: BidStatus) => {
    switch (bidStatus) {
      case BidStatus.LOST:
        return 'LOST';
      case BidStatus.OPEN:
        return 'OPEN';
      case BidStatus.WITHDRAWN:
        return 'WITHDRAWN';
      case BidStatus.WON:
        return 'WON';
      default:
        console.log(`${Logger}: Invalid BitStatus ${bidStatus}`);
    }
  };

  let auctionContent: React.ReactElement | null = null;
  if (auction.status === AuctionStatus.CREATED) {
    auctionContent = (
      <>
        {isEnableBuyNow && (
          <div className="candy-auction-modal-buy-now">
            <div>
              <div className="candy-label">BUY NOW PRICE</div>
              <div className="candy-price">
                <Price value={auction.buyNowPrice} candyShop={candyShop} />
              </div>
            </div>
          </div>
        )}

        <div className="candy-auction-modal-form-item">
          <div className="candy-label">STARTING BID</div>
          <div className="candy-price">
            <Price value={auction.startingBid} candyShop={candyShop} />
          </div>
        </div>
      </>
    );
  } else if (auction.status === AuctionStatus.STARTED) {
    auctionContent = (
      <>
        {isEnableBuyNow && (
          <div className="candy-auction-modal-buy-now">
            <div>
              <div className="candy-label">BUY NOW PRICE</div>
              <div className="candy-price">
                <Price value={auction.buyNowPrice} candyShop={candyShop} />
              </div>
            </div>
            {walletPublicKey ? (
              <button className="candy-button" onClick={buyNow}>
                Buy Now
              </button>
            ) : (
              walletConnectComponent
            )}
          </div>
        )}

        <div className="candy-auction-modal-form-item">
          {auction.highestBidPrice ? (
            <>
              <div className="candy-label">CURRENT BID</div>
              <div className="candy-price">
                <Price value={auction.highestBidPrice} candyShop={candyShop} />
              </div>
            </>
          ) : (
            <>
              <div className="candy-label">STARTING BID</div>
              <div className="candy-price">
                <Price value={auction.startingBid} candyShop={candyShop} />
              </div>
            </>
          )}
        </div>

        {acceptNextBid ? (
          <>
            <div className="candy-auction-modal-control">
              <div>
                <div className="candy-input-label">Enter your bid</div>
                <div className="candy-input-price">
                  <input
                    placeholder={`${String(minNextBid / candyShop.baseUnitsPerCurrency)}+`}
                    min={minNextBid / candyShop.baseUnitsPerCurrency}
                    onChange={(e: any) => setPrice(e.target.value)}
                    type="number"
                    value={price === undefined ? '' : price}
                  />
                  <span>{candyShop?.currencySymbol}</span>
                </div>
              </div>
              {PlaceBidButton}
            </div>
            <div className="candy-auction-modal-prompt">
              Place bid of <Price value={minNextBid} candyShop={candyShop} /> or more
            </div>
          </>
        ) : (
          <div className="candy-auction-modal-prompt">Maximum bid reached. Buy now to win this auction</div>
        )}
      </>
    );
  } else if (
    auction.status === AuctionStatus.COMPLETE ||
    auction.status === AuctionStatus.EXPIRED ||
    auction.status === AuctionStatus.CANCELLED
  ) {
    auctionContent = (
      <>
        <div className="candy-auction-modal-form-item">
          <div className="candy-label">WINNING BID</div>
          <div className="candy-price">
            <Price value={auction.highestBidPrice} candyShop={candyShop} emptyValue="No winner" />
          </div>
        </div>
        {auction.highestBidBuyer && (
          <div className="candy-stat">
            <div className="candy-label">WINNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={auction.highestBidBuyer} />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="candy-auction-modal-detail">
      {ModalAlertElement()}

      <div className="candy-auction-modal-detail-container">
        <div className="candy-auction-modal-thumbnail">
          <LiqImage src={auction?.image || ''} alt={auction?.name} fit="contain" />
        </div>
        <div className="candy-auction-modal-container">
          <div className="candy-auction-modal-countdown">
            <Countdown
              start={Number(auction.startTime)}
              end={Number(auction.startTime) + Number(auction.biddingPeriod)}
              status={auction.status}
            />
          </div>

          <div className="candy-title">{auction?.name}</div>

          {auctionContent}

          {auction.description && (
            <div className="candy-stat">
              <div className="candy-label">DESCRIPTION</div>
              <div className="candy-value">{auction?.description}</div>
            </div>
          )}

          <NftStat owner={auction.sellerAddress} tokenMint={auction.tokenMint} />
          <NftAttributes loading={false} attributes={auction.attributes} />
        </div>
      </div>
    </div>
  );
};
