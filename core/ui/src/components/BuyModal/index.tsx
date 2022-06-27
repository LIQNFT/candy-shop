import { CandyShopTrade, CandyShopTradeBuyParams, CandyShopVersion } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, TransactionState } from 'model';
import React, { useState } from 'react';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import './style.less';

export interface BuyModalProps {
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  connection: web3.Connection;
  isEnterprise: boolean;
  candyShopVersion: CandyShopVersion;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  exchangeInfo,
  shopAddress,
  candyShopProgramId,
  connection,
  isEnterprise,
  candyShopVersion,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash

  const timeoutRef = useUnmountTimeout();

  const buy = async () => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(TransactionState.PROCESSING);

    const tradeBuyParams: CandyShopTradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: connection,
      shopAddress: shopAddress,
      candyShopProgramId: candyShopProgramId,
      isEnterprise: isEnterprise,
      // Replace with the order's
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams)
      .then((txHash) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err) => {
        console.log({ err });
        handleError({ error: err });
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      <div className="candy-buy-modal">
        {state === TransactionState.DISPLAY && (
          <BuyModalDetail
            order={order}
            buy={buy}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
            sellerUrl={sellerUrl}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
        {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
          />
        )}
      </div>
    </Modal>
  );
};
