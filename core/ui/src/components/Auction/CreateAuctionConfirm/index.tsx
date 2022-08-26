import React from 'react';
import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { FormType } from '../AuctionForm';
import { AuctionNftHeader } from '../AuctionNftHeader';
import { getStartTime } from 'utils/timer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './style.less';

interface CreateAuctionConfirmProps {
  selected: SingleTokenInfo;
  onBack: () => void;
  auctionForm: FormType;
  fee?: number;
  showExtensionBidding: boolean;
  currencySymbol: string;
  onCreateAuction: () => void;
}

export const CreateAuctionConfirm: React.FC<CreateAuctionConfirmProps> = ({
  selected,
  onBack,
  auctionForm,
  fee,
  showExtensionBidding,
  currencySymbol,
  onCreateAuction
}) => {
  const confirmDetails = [
    { name: 'Starting bid', value: `${Number(auctionForm.startingBid)} ${currencySymbol}` },
    { name: 'Minimum Incremental Bid', value: `${Number(auctionForm.tickSize)} ${currencySymbol}` },
    {
      name: 'Buy Now Price',
      value: auctionForm.buyNow ? `${Number(auctionForm.buyNowPrice)} ${currencySymbol}` : 'N/A'
    },
    {
      name: 'Fees',
      value: fee ? `${fee.toFixed(1)}%` : 'N/A'
    },
    { name: 'Bidding Period', value: `${auctionForm.biddingPeriod} hour(s)` },
    {
      name: 'Auction Start Date',
      value: getStartTime({
        isNow: auctionForm.startNow,
        hour: auctionForm.auctionHour,
        minute: auctionForm.auctionMinute,
        clockFormat: auctionForm.clockFormat,
        date: auctionForm.startDate
      })
    }
  ];

  if (showExtensionBidding && !auctionForm.disableBiddingExtension) {
    confirmDetails.splice(-1, 0, {
      name: 'Final Bidding Window',
      value: `${Number(auctionForm.extensionPeriod) / 60} mins`
    });
  }

  return (
    <div className="candy-auction-confirm-container">
      <div className="candy-auction-confirm-title">
        Review and confirm the auction details are correct. You can cancel the auction before it starts, but once an
        auction begins, you will have to sell to the highest bidder.
      </div>
      {selected ? (
        <AuctionNftHeader
          name={selected.metadata?.data.name}
          ticker={selected.metadata?.data.symbol}
          imgUrl={selected.nftImage}
          edition={selected.edition}
        />
      ) : null}

      <div className="candy-auction-confirm-break" />
      {confirmDetails.map(({ name, value }: { name: string; value: string }) => (
        <div className="candy-auction-confirm" key={name}>
          <span>{name}</span>
          <div>{value}</div>
        </div>
      ))}

      <div className="candy-auction-confirm-button-container">
        <button className="candy-button candy-button-default" onClick={onBack}>
          Back
        </button>
        <button className="candy-button candy-auction-confirm-button" onClick={onCreateAuction}>
          Create Auction
        </button>
      </div>
    </div>
  );
};
