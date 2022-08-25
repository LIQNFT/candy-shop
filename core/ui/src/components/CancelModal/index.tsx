import React, { useState } from 'react';
import {
  CandyShop,
  CandyShopTrade,
  CandyShopTradeCancelParams,
  CandyShopVersion,
  getCandyShopSync
} from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { PoweredByInBuyModal } from 'components/PoweredBy/PowerByInBuyModal';
import { Processing } from 'components/Processing';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, TransactionState } from 'model';
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
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  candyShop: CandyShop;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose,
  wallet,
  exchangeInfo,
  connection,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  candyShop
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const timeoutRef = useUnmountTimeout();
  const shopAddress = getCandyShopSync(
    new web3.PublicKey(order.candyShopCreatorAddress),
    new web3.PublicKey(order.treasuryMint),
    new web3.PublicKey(order.programId)
  )[0].toString();

  const cancel = async () => {
    setState(TransactionState.PROCESSING);

    const tradeCancelParams: CandyShopTradeCancelParams = {
      connection: connection,
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      shopAddress: new web3.PublicKey(shopAddress),
      candyShopProgramId: new web3.PublicKey(order.programId),
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
    <Modal
      className="candy-buy-modal-container"
      onCancel={onClose}
      width={state !== TransactionState.DISPLAY ? 600 : 1000}
    >
      {state === TransactionState.DISPLAY && wallet && (
        <CancelModalDetail
          order={order}
          cancel={cancel}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={shopPriceDecimalsMin}
          shopPriceDecimals={shopPriceDecimals}
          candyShop={candyShop}
        />
      )}
      {state === TransactionState.PROCESSING && <Processing text="Canceling your sale" />}
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={order} onCancel={onClose} />}
      <PoweredByInBuyModal />
    </Modal>
  );
};
