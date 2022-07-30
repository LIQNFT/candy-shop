import React from 'react';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { formatDate } from 'utils/timer';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import { IconTick } from 'assets/IconTick';
import { IconError } from 'assets/IconError';
import { ShopExchangeInfo, PaymentErrorDetails } from 'model';
import { getPrice } from 'utils/getPrice';
import { CandyShop } from '@liqnft/candy-shop-sdk';

interface BuyModalConfirmedProps {
  order: OrderSchema;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  onClose: () => void;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  candyShop: CandyShop;
  paymentPrice?: number;
  error?: PaymentErrorDetails;
}

const PaymentErrorMessage: React.FC<{ error: PaymentErrorDetails }> = ({ error }) => {
  const { content, moreInfo } = error;
  return (
    <>
      <div>{content}</div>
      {moreInfo?.content ? (
        <div>
          {moreInfo.content}.
          <a href={moreInfo.link} target="_blank" rel="noreferrer noopener">
            {moreInfo.linkText}
          </a>
        </div>
      ) : null}
    </>
  );
};

export const BuyModalConfirmed: React.FC<BuyModalConfirmedProps> = ({
  order,
  txHash,
  walletPublicKey,
  onClose,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  candyShop,
  paymentPrice,
  error
}) => {
  const walletAddress = walletPublicKey?.toBase58();

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <div className="candy-buy-modal-confirmed">
      <div className="candy-buy-modal-confirmed-header">
        {error ? <IconError /> : <IconTick />}
        <div>{error ? 'Transaction could not be completed' : 'Transaction Confirmed'}</div>
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
                ~$ <span>{paymentPrice} USD</span>
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
              source={candyShop.explorerLink}
              env={candyShop.env}
            />
          </div>
        </div>
        <div className="candy-buy-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">
            {walletAddress && (
              <ExplorerLink
                type="address"
                address={walletAddress}
                source={candyShop.explorerLink}
                env={candyShop.env}
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
                <ExplorerLink type="tx" address={txHash} />
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
