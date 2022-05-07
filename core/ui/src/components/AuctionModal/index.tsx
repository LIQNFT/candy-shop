import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import BuyModalConfirmed from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { TransactionState } from 'model';
// import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';

import './style.less';
import { web3, BN } from '@project-serum/anchor';
import { notification, NotificationType } from 'utils/rc-notification';

const Logger = 'CandyShopUI/AuctionModal';

export interface AuctionModalProps {
  order: Auction;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  candyShop
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash

  // const timeoutRef = useUnmountTimeout();

  const placeBid = (price: number) => {
    if (!wallet) return;

    const highestBidPrice = order.highestBidPrice || order.startingBid;
    const tickSize = order.tickSize;
    const minBidPrice = (Number(highestBidPrice) + Number(tickSize)) / candyShop.baseUnitsPerCurrency;

    if (price < minBidPrice) {
      return notification('Your bid must be greater than current bid + tick size', NotificationType.Error);
    }

    setState(TransactionState.PROCESSING);
    candyShop
      .bidAuction({
        wallet,
        tokenMint: new web3.PublicKey(order.tokenMint),
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        bidPrice: new BN(price * candyShop.baseUnitsPerCurrency)
      })
      .then((txId) => {
        console.log(txId);
        setHash(txId);
        notification('Bid Auction successful.', NotificationType.Success);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} fail=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const buyNow = () => {
    if (!wallet) return;

    setState(TransactionState.PROCESSING);
    candyShop
      .buyNowAuction({
        wallet,
        tokenMint: new web3.PublicKey(order.tokenMint),
        tokenAccount: new web3.PublicKey(order.tokenAccount)
      })
      .then((txId) => {
        console.log(txId);
        setHash(txId);
        notification('Buy Now Auction successful.', NotificationType.Success);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} fail=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  const withdraw = () => {
    if (!wallet) return;

    setState(TransactionState.PROCESSING);
    candyShop
      .withdrawAuctionBid({
        wallet,
        tokenMint: new web3.PublicKey(order.tokenMint),
        tokenAccount: new web3.PublicKey(order.tokenAccount)
      })
      .then((txId) => {
        console.log(txId);
        setHash(txId);
        notification('Withdraw Auction Bid successful.', NotificationType.Success);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err) => {
        notification(err.message, NotificationType.Error);
        console.log(`${Logger} fail=`, err);
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      <div className="candy-auction-modal">
        {state === TransactionState.DISPLAY && (
          <AuctionModalDetail
            order={order}
            buy={placeBid}
            buyNow={buyNow}
            withdraw={withdraw}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            candyShop={candyShop}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
        {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            // candyShop={candyShop}
          />
        )}
      </div>
    </Modal>
  );
};
