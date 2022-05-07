import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import { AuctionModalConfirmed } from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { TransactionState } from 'model';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';

import { notification, NotificationType } from 'utils/rc-notification';
import './style.less';

const Logger = 'CandyShopUI/AuctionModal';

export interface AuctionModalProps {
  auction: Auction;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  auction,
  onClose,
  wallet,
  walletConnectComponent,
  candyShop
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState('');
  const [processingText, setProcessingText] = useState<string>('Processing Transaction');
  const [titleText, setTitleText] = useState<string>('Transaction Confirmed');

  const placeBid = (price: number) => {
    if (!wallet) return;

    const minBidPrice =
      (auction.highestBidPrice
        ? Number(auction.highestBidPrice) + Number(auction.tickSize)
        : Number(auction.startingBid)) / candyShop.baseUnitsPerCurrency;

    if (price < minBidPrice) {
      return notification(`You must bid at least ${minBidPrice}`, NotificationType.Error);
    }

    setProcessingText('Processing Bid');
    setState(TransactionState.PROCESSING);
    candyShop
      .bidAuction({
        wallet,
        tokenMint: new web3.PublicKey(auction.tokenMint),
        tokenAccount: new web3.PublicKey(auction.tokenAccount),
        bidPrice: new BN(price * candyShop.baseUnitsPerCurrency)
      })
      .then((txId: string) => {
        console.log(`${Logger}: bidAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText('Bid Confirmed');
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} bidAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const buyNow = () => {
    if (!wallet) return;

    setProcessingText('Processing Transaction');
    setState(TransactionState.PROCESSING);
    candyShop
      .buyNowAuction({
        wallet,
        tokenMint: new web3.PublicKey(auction.tokenMint),
        tokenAccount: new web3.PublicKey(auction.tokenAccount)
      })
      .then((txId: string) => {
        console.log(`${Logger}: buyNowAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText('Transaction Confirmed');
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} buyNowAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const withdraw = () => {
    if (!wallet) return;

    setProcessingText('Processing Withdraw');
    setState(TransactionState.PROCESSING);
    candyShop
      .withdrawAuctionBid({
        wallet,
        tokenMint: new web3.PublicKey(auction.tokenMint),
        tokenAccount: new web3.PublicKey(auction.tokenAccount)
      })
      .then((txId: string) => {
        console.log(`${Logger}: withdrawAuctionBid request success, txId=`, txId);
        setHash(txId);
        setTitleText('Withdrawal Confirmed');
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        notification(err.message, NotificationType.Error);
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
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            candyShop={candyShop}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text={processingText} />}
        {state === TransactionState.CONFIRMED && wallet && (
          <AuctionModalConfirmed
            titleText={titleText}
            walletPublicKey={wallet.publicKey}
            auction={auction}
            txHash={hash}
            onClose={onClose}
          />
        )}
      </div>
    </Modal>
  );
};
