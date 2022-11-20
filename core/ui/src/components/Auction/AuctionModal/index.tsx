import React, { useState } from 'react';

import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import { AuctionModalConfirmed } from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { ConfigPrice, TransactionState } from 'model';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Auction, Blockchain } from '@liqnft/candy-shop-types';

import { notification, NotificationType } from 'utils/rc-notification';
import './style.less';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { handleError } from 'utils/ErrorHandler';

const Logger = 'CandyShopUI/AuctionModal';

export interface AuctionModalProps extends ConfigPrice {
  auction: Auction;
  walletPublicKey: string | undefined;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  walletConnectComponent: React.ReactElement;
  buyNowAuction(auction: Auction): Promise<string>;
  bidAuction(auction: Auction, price: number): Promise<string>;
  withdrawAuctionBid(auction: Auction): Promise<string>;
  onClose: () => void;
}

enum TitleTextType {
  BID_CONFIRMED = 'Bid Confirmed',
  TRANSACTION_CONFIRMED = 'Transaction Confirmed',
  WITHDRAWAL_CONFIRMED = 'Withdrawal Confirmed'
}
enum ProcessingTextType {
  BID = 'Processing Bid',
  TRANSACTION = 'Processing Transaction',
  WITHDRAW = 'Processing Withdraw'
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  auction,
  baseUnitsPerCurrency,
  walletPublicKey,
  candyShopEnv,
  currencySymbol,
  explorerLink,
  walletConnectComponent,
  onClose,
  bidAuction,
  buyNowAuction,
  withdrawAuctionBid,
  priceDecimals,
  priceDecimalsMin
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState<string>('');
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.TRANSACTION);
  const [titleText, setTitleText] = useState<TitleTextType>(TitleTextType.TRANSACTION_CONFIRMED);
  const [bidPrice, setBidPrice] = useState<number>();

  const buyNow = () => {
    setProcessingText(ProcessingTextType.TRANSACTION);
    setState(TransactionState.PROCESSING);

    buyNowAuction(auction)
      .then((txId: string) => {
        console.log(`${Logger}: buyNowAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.TRANSACTION_CONFIRMED);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        handleError(err);
        console.log(`${Logger} buyNowAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const placeBid = (price: number) => {
    // buy now when price > buyNowPrice
    if (price * baseUnitsPerCurrency >= Number(auction.buyNowPrice)) return buyNow();

    if (!walletPublicKey) return;

    const minBidPrice =
      (auction.highestBidPrice
        ? Number(auction.highestBidPrice) + Number(auction.tickSize)
        : Number(auction.startingBid)) / baseUnitsPerCurrency;

    if (price < minBidPrice) {
      return notification(`You must bid at least ${minBidPrice}`, NotificationType.Error);
    }

    setProcessingText(ProcessingTextType.BID);
    setState(TransactionState.PROCESSING);

    // TODO: refactor get Action function

    bidAuction(auction, price)
      .then((txId: string) => {
        console.log(`${Logger}: bidAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.BID_CONFIRMED);
        setState(TransactionState.CONFIRMED);
        setBidPrice(price);
      })
      .catch((err: Error) => {
        handleError(err);
        console.log(`${Logger} bidAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const withdraw = () => {
    setProcessingText(ProcessingTextType.WITHDRAW);
    setState(TransactionState.PROCESSING);

    withdrawAuctionBid(auction)
      .then((txId: string) => {
        console.log(`${Logger}: withdrawAuctionBid request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.WITHDRAWAL_CONFIRMED);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        handleError(err);
        console.log(`${Logger} withdrawAuctionBid failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      <div className="candy-auction-modal">
        {state === TransactionState.DISPLAY && (
          <AuctionModalDetail
            auction={auction}
            placeBid={placeBid}
            buyNow={buyNow}
            onWithdrew={withdraw}
            walletConnectComponent={walletConnectComponent}
            walletPublicKey={walletPublicKey}
            baseUnitsPerCurrency={baseUnitsPerCurrency}
            currencySymbol={currencySymbol}
            priceDecimalsMin={priceDecimalsMin}
            priceDecimals={priceDecimals}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text={processingText} />}
        {state === TransactionState.CONFIRMED && walletPublicKey && (
          <AuctionModalConfirmed
            titleText={titleText}
            auction={auction}
            txHash={hash}
            onClose={onClose}
            descriptionText={bidPrice ? `${bidPrice} ${currencySymbol}` : undefined}
            walletAddress={walletPublicKey}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
          />
        )}
      </div>
      <PoweredByInBuyModal />
    </Modal>
  );
};
