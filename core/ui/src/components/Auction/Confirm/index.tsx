import React from 'react';
import { SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { FormType } from '../Form/Form.utils';
import { AuctionNftHeader } from '../AuctionNftHeader';
import { getFormTime } from 'utils/timer';

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
    {
      name: 'Auction Start Date',
      value: getFormTime({
        isNow: auctionForm.startNow,
        hour: auctionForm.startHour,
        minute: auctionForm.startMinute,
        clockFormat: auctionForm.startClockFormat,
        date: auctionForm.startDate
      })
    },
    {
      name: 'Auction End Date',
      value: getFormTime({
        hour: auctionForm.endHour,
        minute: auctionForm.endMinute,
        clockFormat: auctionForm.endClockFormat,
        date: auctionForm.endDate
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
