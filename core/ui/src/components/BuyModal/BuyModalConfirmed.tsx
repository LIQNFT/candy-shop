import React from 'react';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { formatDate } from 'utils/timer';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import { IconTick } from 'assets/IconTick';
import { ShopExchangeInfo, PaymentErrorDetails } from 'model';
import { getPrice } from 'utils/getPrice';
import { IconError } from 'assets/IconError';

interface BuyModalConfirmedProps {
  order: OrderSchema;
  txHash: string;
  walletPublicKey: string | undefined;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  paymentPrice?: number;
  error?: PaymentErrorDetails;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  onClose: () => void;
}

const PaymentErrorMessage: React.FC<{ error: PaymentErrorDetails }> = ({ error }) => {
  const { content, moreInfo } = error;
  return (
    <>
      <div>{content}</div>
      {moreInfo?.content ? (
        <div>
          {moreInfo.content + ' '}
          <a href={moreInfo.link} target="_blank" rel="noreferrer noopener">
            {moreInfo.linkText + '.'}
          </a>
        </div>
      ) : null}
    </>
  );
};

export const BuyModalConfirmed: React.FC<BuyModalConfirmedProps> = ({
  walletPublicKey,
  order,
  txHash,
  onClose,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  paymentPrice,
  error,
  candyShopEnv,
  explorerLink
}) => {
  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <div className="candy-buy-modal-confirmed">
      <div className="candy-buy-modal-confirmed-header">
        {error ? <IconError /> : <IconTick />}
        <div>{error ? error.title : 'Transaction Confirmed'}</div>
      </div>
      {error ? (
        <div className="candy-buy-confirmed-error-message">
          <PaymentErrorMessage error={error} />
        </div>
      ) : null}
      <div className="candy-buy-modal-confirmed-container">
        <div className="candy-buy-modal-confirmed-thumbnail">
          <LiqImage src={order?.nftImageLink} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-buy-modal-confirmed-content">
          <div>
            <div className="candy-buy-modal-name">{order?.name}</div>
            <div className="candy-buy-modal-ticker">{order?.ticker}</div>
          </div>
          <div style={{ display: 'flex' }}>
            <div className="candy-buy-modal-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
            {paymentPrice && (
              <span className="candy-payment-confirmed-price">
                ~$US<span>{paymentPrice}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <hr />
      <div className="candy-buy-modal-confirmed-flex">
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink
              type="address"
              address={order.walletAddress}
              candyShopEnv={candyShopEnv}
              explorerLink={explorerLink}
            />
          </div>
        </div>
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">
            {walletPublicKey && (
              <ExplorerLink
                type="address"
                address={walletPublicKey}
                candyShopEnv={candyShopEnv}
                explorerLink={explorerLink}
              />
            )}
          </div>
        </div>
        {error ? (
          <div style={{ width: '100%', height: '40px' }} />
        ) : (
          <>
            <div className="candy-buy-modal-confirmed-item">
              <div className="candy-label">TRANSACTION HASH</div>
              <div className="candy-value">
                <ExplorerLink type="tx" address={txHash} candyShopEnv={candyShopEnv} explorerLink={explorerLink} />
              </div>
            </div>
            <div className="candy-buy-modal-confirmed-item">
              <div className="candy-label">CONFIRMED ON</div>
              <div className="candy-value">{formatDate(new Date())}</div>
            </div>
          </>
        )}
      </div>
      {error ? null : (
        <button className="candy-button" onClick={onClose}>
          Continue Shopping
        </button>
      )}
    </div>
  );
};
