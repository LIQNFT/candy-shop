import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';
import { ShopExchangeInfo, TransactionState } from 'model';
import React, { useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';
import './index.less';

export interface CancelModalProps {
  order: OrderSchema;
  onClose: any;
  wallet: AnchorWallet;
  candyShop: CandyShop;
  shopExchangeInfo: ShopExchangeInfo;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose: onUnSelectItem,
  wallet,
  candyShop,
  shopExchangeInfo
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);

  // Handle change step
  const onChangeStep = (state: TransactionState) => setState(state);

  const onCloseModal = () => {
    onUnSelectItem();
  };

  return (
    <Modal onCancel={onCloseModal} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      {state === TransactionState.DISPLAY && wallet && (
        <CancelModalDetail
          onCancel={onUnSelectItem}
          order={order}
          onChangeStep={onChangeStep}
          wallet={wallet}
          candyShop={candyShop}
          shopExchangeInfo={shopExchangeInfo}
        />
      )}
      {state === TransactionState.PROCESSING && <Processing text="Canceling your sale" />}
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={order} onCancel={onCloseModal} />}
    </Modal>
  );
};
