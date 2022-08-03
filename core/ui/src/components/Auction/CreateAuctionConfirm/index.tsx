import React from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';

import { FormType } from '../AuctionForm';
import { AuctionNftHeader } from '../AuctionNftHeader';

import { notification, NotificationType } from 'utils/rc-notification';
import { getStartTime, convertTime12to24 } from 'utils/timer';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './style.less';

interface CreateAuctionProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  selected: SingleTokenInfo;
  onBack: () => void;
  auctionForm: FormType;
  onCreateAuctionSuccess?: (auctionedToken: SingleTokenInfo) => void;
  fee?: number;
}

const Logger = 'CandyShopUI/CreateAuction';

export const CreateAuctionConfirm: React.FC<CreateAuctionProps> = ({
  candyShop,
  wallet,
  selected,
  onBack,
  auctionForm,
  onCreateAuctionSuccess,
  fee
}) => {
  const onCreateAuction = () => {
    if (!wallet || !auctionForm || !selected) return;

    const startingBid = new BN(Number(auctionForm.startingBid) * 10 ** candyShop.currencyDecimals);
    const startTime = new BN(
      //prettier-ignore
      dayjs(auctionForm.startNow ? undefined : `${auctionForm.startDate} ${convertTime12to24(auctionForm.auctionHour, auctionForm.auctionMinute, auctionForm.clockFormat)} UTC`).unix()
    );
    const biddingPeriod = new BN(Number(auctionForm.biddingPeriod) * 3600);
    const buyNowPrice = auctionForm.buyNow
      ? new BN(Number(auctionForm.buyNowPrice) * 10 ** candyShop.currencyDecimals)
      : null;
    const tickSize = new BN(Number(auctionForm.tickSize) * 10 ** candyShop.currencyDecimals);

    candyShop
      .createAuction({
        startingBid,
        startTime,
        biddingPeriod,
        buyNowPrice,
        tokenAccount: new web3.PublicKey(selected.tokenAccountAddress),
        tokenMint: new web3.PublicKey(selected.tokenMintAddress),
        wallet,
        tickSize
      })
      .then(() => {
        notification('Auction created', NotificationType.Success);
        onCreateAuctionSuccess && onCreateAuctionSuccess(selected);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: Create Auction failed=`, err);
        notification(err.message, NotificationType.Error);
      });
  };

  const confirmDetails = [
    { name: 'Starting bid', value: `${Number(auctionForm.startingBid)} ${candyShop.currencySymbol}` },
    { name: 'Minimum Incremental Bid', value: `${Number(auctionForm.tickSize)} ${candyShop.currencySymbol}` },
    {
      name: 'Buy Now Price',
      value: auctionForm.buyNow ? `${Number(auctionForm.buyNowPrice)} ${candyShop.currencySymbol}` : 'N/A'
    },
    {
      name: 'Fees',
      value: fee ? `${fee.toFixed(1)}%` : 'N/A'
    },
    { name: 'Bidding Period', value: `${auctionForm.biddingPeriod} hour(s)` },
    {
      name: 'Auction Start Date',
      value: getStartTime({
        hour: auctionForm.auctionHour,
        minute: auctionForm.auctionMinute,
        clockFormat: auctionForm.clockFormat,
        date: auctionForm.startDate
      })
    }
  ];

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
