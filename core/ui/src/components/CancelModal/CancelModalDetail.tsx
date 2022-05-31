import '@google/model-viewer';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from 'components/ExplorerLink';
import { Viewer } from 'components/Viewer';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { ShopExchangeInfo, TransactionState } from 'model';
import React from 'react';
import { handleError } from 'utils/ErrorHandler';
import { getPrice } from 'utils/getPrice';

export interface CancelModalDetailProps {
  onCancel: any;
  order: OrderSchema;
  onChangeStep: (state: TransactionState) => void;
  wallet: AnchorWallet;
  candyShop: CandyShop;
  exchangeInfo: ShopExchangeInfo;
}

export const CancelModalDetail: React.FC<CancelModalDetailProps> = ({
  order,
  onChangeStep,
  wallet,
  candyShop,
  exchangeInfo
}) => {
  const timeoutRef = useUnmountTimeout();

  const cancel = async () => {
    onChangeStep(TransactionState.PROCESSING);
    candyShop
      .cancel({
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        tokenMint: new web3.PublicKey(order.tokenMint),
        price: new BN(order.price),
        wallet
      })
      .then(() => {
        timeoutRef.current = setTimeout(() => {
          onChangeStep(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err) => {
        handleError({ error: err });
        onChangeStep(TransactionState.DISPLAY);
      });
  };

  const orderPrice = getPrice(candyShop, order, exchangeInfo);

  return (
    <div className="candy-cancel-modal">
      <div className="candy-cancel-modal-thumbnail">
        <Viewer order={order} />
      </div>

      <div className="candy-cancel-modal-container">
        <div className="candy-title">{order.name}</div>
        <div className="candy-cancel-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          <button className="candy-button candy-cancel-modal-button" onClick={cancel}>
            {buttonContent}
          </button>
        </div>
        {order?.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order.nftDescription}</div>
          </div>
        )}
        <div className="candy-stat-horizontal">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.tokenMint} />
            </div>
          </div>
          {order?.edition ? (
            <>
              <div className="candy-stat-horizontal-line" />
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
            </>
          ) : null}
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">CURRENT OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order.walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const buttonContent = 'Cancel listing';
