import { CandyShopTrade, CandyShopTradeCancelParams, CandyShopVersion } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, TransactionState } from 'model';
import React, { useState } from 'react';
import { handleError } from 'utils/ErrorHandler';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';
import './index.less';

const Logger = 'CandyShopUI/CancelModal';

export interface CancelModalProps {
  order: OrderSchema;
  onClose: any;
  wallet: AnchorWallet;
  exchangeInfo: ShopExchangeInfo;
  connection: web3.Connection;
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  candyShopVersion: CandyShopVersion;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose,
  wallet,
  exchangeInfo,
  connection,
  shopAddress,
  candyShopProgramId,
  candyShopVersion,
  shopPriceDecimalsMin,
  shopPriceDecimals
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const timeoutRef = useUnmountTimeout();

  const cancel = async () => {
    setState(TransactionState.PROCESSING);

    const tradeCancelParams: CandyShopTradeCancelParams = {
      connection: connection,
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      shopAddress: shopAddress,
      candyShopProgramId: candyShopProgramId,
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint),
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress)
    };

    return CandyShopTrade.cancel(tradeCancelParams)
      .then((txHash) => {
        console.log(`${Logger}: Cancel order made with transaction hash=${txHash}`);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err: Error) => {
        handleError({ error: err });
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      {state === TransactionState.DISPLAY && wallet && (
        <CancelModalDetail
          order={order}
          cancel={cancel}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={shopPriceDecimalsMin}
          shopPriceDecimals={shopPriceDecimals}
        />
      )}
      {state === TransactionState.PROCESSING && <Processing text="Canceling your sale" />}
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={order} onCancel={onClose} />}
    </Modal>
  );
};
