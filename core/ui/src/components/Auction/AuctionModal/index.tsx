import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import { AuctionModalConfirmed } from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { CommonChain, EthWallet, TransactionState } from 'model';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';

import { notification, NotificationType } from 'utils/rc-notification';
import './style.less';

const Logger = 'CandyShopUI/AuctionModal';

export interface AuctionModalType<C, S, W> extends CommonChain<C, S, W> {
  auction: Auction;
  onClose: () => void;
  walletConnectComponent: React.ReactElement;
}

type AuctionModalProps =
  | AuctionModalType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | AuctionModalType<Blockchain.Solana, CandyShop, AnchorWallet>;

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
  onClose,
  walletConnectComponent,
  ...chainProps
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState<string>('');
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.TRANSACTION);
  const [titleText, setTitleText] = useState<TitleTextType>(TitleTextType.TRANSACTION_CONFIRMED);
  const [bidPrice, setBidPrice] = useState<number>();

  const buyNow = () => {
    if (!chainProps.wallet) return;

    setProcessingText(ProcessingTextType.TRANSACTION);
    setState(TransactionState.PROCESSING);
    const getAction = (): any => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana: {
          if (!chainProps.wallet) return;
          return chainProps.candyShop.buyNowAuction({
            wallet: chainProps.wallet,
            tokenMint: new web3.PublicKey(auction.tokenMint),
            tokenAccount: new web3.PublicKey(auction.tokenAccount)
          });
        }
        default:
          return new Promise((res) => {
            console.log('WIP');
            res('');
          });
      }
    };
    getAction()
      .then((txId: string) => {
        console.log(`${Logger}: buyNowAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.TRANSACTION_CONFIRMED);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} buyNowAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const placeBid = (price: number) => {
    // buy now when price > buyNowPrice
    if (price * chainProps.candyShop.baseUnitsPerCurrency >= Number(auction.buyNowPrice)) return buyNow();

    if (!chainProps.wallet) return;

    const minBidPrice =
      (auction.highestBidPrice
        ? Number(auction.highestBidPrice) + Number(auction.tickSize)
        : Number(auction.startingBid)) / chainProps.candyShop.baseUnitsPerCurrency;

    if (price < minBidPrice) {
      return notification(`You must bid at least ${minBidPrice}`, NotificationType.Error);
    }

    setProcessingText(ProcessingTextType.BID);
    setState(TransactionState.PROCESSING);

    // TODO: refactor get Action function
    const getAction = (): any => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana: {
          if (!chainProps.wallet) return;
          return chainProps.candyShop.bidAuction({
            wallet: chainProps.wallet,
            tokenMint: new web3.PublicKey(auction.tokenMint),
            tokenAccount: new web3.PublicKey(auction.tokenAccount),
            bidPrice: new BN(price * chainProps.candyShop.baseUnitsPerCurrency)
          });
        }
        default:
          return new Promise((res) => {
            console.log('WIP ETH');
            res('');
          });
      }
    };
    getAction()
      .then((txId: string) => {
        console.log(`${Logger}: bidAuction request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.BID_CONFIRMED);
        setState(TransactionState.CONFIRMED);
        setBidPrice(price);
      })
      .catch((err: Error) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} bidAuction failed, error=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const withdraw = () => {
    if (!chainProps.wallet) return;

    setProcessingText(ProcessingTextType.WITHDRAW);
    setState(TransactionState.PROCESSING);

    const getAction = (): any => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana: {
          if (!chainProps.wallet) return;
          return chainProps.candyShop.withdrawAuctionBid({
            wallet: chainProps.wallet,
            tokenMint: new web3.PublicKey(auction.tokenMint),
            tokenAccount: new web3.PublicKey(auction.tokenAccount)
          });
        }
        default:
          return new Promise((res) => {
            console.log('WIP ETH');
            res('');
          });
      }
    };

    getAction()
      .then((txId: string) => {
        console.log(`${Logger}: withdrawAuctionBid request success, txId=`, txId);
        setHash(txId);
        setTitleText(TitleTextType.WITHDRAWAL_CONFIRMED);
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
            walletConnectComponent={walletConnectComponent}
            {...chainProps}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text={processingText} />}
        {state === TransactionState.CONFIRMED && chainProps.wallet && (
          <AuctionModalConfirmed
            titleText={titleText}
            auction={auction}
            txHash={hash}
            onClose={onClose}
            descriptionText={bidPrice ? `${bidPrice} ${chainProps.candyShop.currencySymbol}` : undefined}
            {...chainProps}
          />
        )}
      </div>
    </Modal>
  );
};
