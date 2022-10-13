import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import { AuctionModalConfirmed } from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { TransactionState } from 'model';
import { CandyShop, CandyShopAuction, CandyShopVersion, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';

import { notification, NotificationType } from 'utils/rc-notification';
import './style.less';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';

const Logger = 'CandyShopUI/AuctionModal';

interface ShopInfo {
  candyShopAddress: string;
  programId: string;
  treasuryMint: string;
  candyShopCreatorAddress: string;
  connection: () => web3.Connection;
  env: web3.Cluster;
  version: CandyShopVersion;
  baseUnitsPerCurrency: number;
  currencySymbol: string;
  explorerLink: ExplorerLinkBase;
  priceDecimalsMin: number;
  priceDecimals: number;
}

export interface AuctionModalProps {
  auction: Auction;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop | ShopInfo;
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
  onClose,
  wallet,
  walletConnectComponent,
  candyShop
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState<string>('');
  const [processingText, setProcessingText] = useState<ProcessingTextType>(ProcessingTextType.TRANSACTION);
  const [titleText, setTitleText] = useState<TitleTextType>(TitleTextType.TRANSACTION_CONFIRMED);
  const [bidPrice, setBidPrice] = useState<number>();

  const buyNow = () => {
    if (!wallet) return;

    setProcessingText(ProcessingTextType.TRANSACTION);
    setState(TransactionState.PROCESSING);
    CandyShopAuction.buyNow({
      tokenAccount: new web3.PublicKey(auction.tokenAccount),
      tokenMint:new web3.PublicKey(auction.tokenMint),
      wallet,
      shopAddress: new web3.PublicKey(candyShop.candyShopAddress),
      candyShopProgramId: new web3.PublicKey(candyShop.programId),
      shopTreasuryMint: new web3.PublicKey(candyShop.treasuryMint),
      shopCreatorAddress: new web3.PublicKey(candyShop.candyShopCreatorAddress),
      connection: candyShop.connection(),
      env: candyShop.env,
      version: candyShop.version
    })
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
    if (price * candyShop.baseUnitsPerCurrency >= Number(auction.buyNowPrice)) return buyNow();

    if (!wallet) return;

    const minBidPrice =
      (auction.highestBidPrice
        ? Number(auction.highestBidPrice) + Number(auction.tickSize)
        : Number(auction.startingBid)) / candyShop.baseUnitsPerCurrency;

    if (price < minBidPrice) {
      return notification(`You must bid at least ${minBidPrice}`, NotificationType.Error);
    }

    setProcessingText(ProcessingTextType.BID);
    setState(TransactionState.PROCESSING);
    CandyShopAuction.bid({
      tokenAccount: new web3.PublicKey(auction.tokenAccount),
      tokenMint: new web3.PublicKey(auction.tokenMint),
      wallet,
      shopAddress: new web3.PublicKey(candyShop.candyShopAddress),
      candyShopProgramId: new web3.PublicKey(candyShop.programId),
      shopTreasuryMint: new web3.PublicKey(candyShop.treasuryMint),
      shopCreatorAddress: new web3.PublicKey(candyShop.candyShopCreatorAddress),
      connection: candyShop.connection(),
      version: candyShop.version,
      bidPrice: new BN(price * candyShop.baseUnitsPerCurrency)
    })
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
    if (!wallet) return;

    setProcessingText(ProcessingTextType.WITHDRAW);
    setState(TransactionState.PROCESSING);
    CandyShopAuction.withdrawBid({
      tokenAccount: new web3.PublicKey(auction.tokenAccount),
      tokenMint: new web3.PublicKey(auction.tokenMint),
      wallet,
      shopAddress: new web3.PublicKey(candyShop.candyShopAddress),
      candyShopProgramId: new web3.PublicKey(candyShop.programId),
      shopTreasuryMint: new web3.PublicKey(candyShop.treasuryMint),
      shopCreatorAddress: new web3.PublicKey(candyShop.candyShopCreatorAddress),
      connection: candyShop.connection(),
      version: candyShop.version,
    })
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
            descriptionText={bidPrice ? `${bidPrice} ${candyShop.currencySymbol}` : undefined}
            candyShop={candyShop}
          />
        )}
      </div>
      <PoweredByInBuyModal />
    </Modal>
  );
};
