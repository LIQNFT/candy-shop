import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { ExplorerLink } from 'components/ExplorerLink';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';
import { ShopExchangeInfo } from 'model';
import React from 'react';
import { getPrice } from 'utils/getPrice';

export interface CancelModalDetailProps {
  order: OrderSchema;
  cancel: () => void;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
}

export const CancelModalDetail: React.FC<CancelModalDetailProps> = ({
  order,
  cancel,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals
}) => {
  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

  return (
    <div className="candy-cancel-modal">
      <div className="candy-cancel-modal-thumbnail">
        <Viewer order={order} />
      </div>

      <div className="candy-cancel-modal-container">
        <div className="candy-cancel-title">
          <div className="candy-title">{order.name}</div>
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-cancel-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          <button className="candy-button candy-cancel-modal-button" onClick={cancel}>
            Cancel listing
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
