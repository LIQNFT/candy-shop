import * as anchor from '@project-serum/anchor';
import React, { useState } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';

import BuyModalConfirmed from './AuctionModalConfirmed';
import { AuctionModalDetail } from './AuctionModalDetail';

import { TransactionState } from 'model';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Auction } from '@liqnft/candy-shop-types';

import './style.less';
import { web3 } from '@project-serum/anchor';
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

  const timeoutRef = useUnmountTimeout();

  const placeBid = (price: number) => {
    if (!wallet) return;
    if (price < Number(order.startingBid) / candyShop.baseUnitsPerCurrency) {
      return notification('Your bid must be greater than current price', NotificationType.Error);
    }

    setState(TransactionState.PROCESSING);
    candyShop
      .bidAuction({
        wallet,
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        tokenMint: new web3.PublicKey(order.tokenMint),
        bidPrice: new anchor.BN(price)
      })
      .then((res) => {
        console.log({ res });
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
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        tokenMint: new web3.PublicKey(order.tokenMint)
      })
      .then((res) => {
        console.log({ res });
        notification('Buy Now Auction successful.', NotificationType.Success);
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
            candyShop={candyShop}
          />
        )}
      </div>
    </Modal>
  );
};
