import React from 'react';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { IconPlayer } from 'assets/IconPlayer';
import { LiqImage } from 'components/LiqImage';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { getExchangeInfo } from 'utils/getExchangeInfo';
import { getPrice } from 'utils/getPrice';
import { ShopProps } from 'model';
import './index.less';

interface OrderProps extends ShopProps {
  order: OrderSchema;
  walletConnectComponent: React.ReactElement;
  url?: string;
  sellerUrl?: string;
  onOrderSelection: (order?: OrderSchema) => void;
}

export const Order: React.FC<OrderProps> = ({ order, onOrderSelection, url, candyShop, wallet }) => {
  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
      return;
    }
    onOrderSelection(order);
  };

  const exchangeInfo = getExchangeInfo(order, candyShop);
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order.price, exchangeInfo);
  // ETH address can be Checksum Address with full lowercase characters, which different from origin address
  const isUserListing =
    wallet?.publicKey && order.walletAddress.toLowerCase() === wallet.publicKey.toString().toLowerCase();

  return (
    <div className="candy-order candy-card-border" onClick={onClick}>
      {isUserListing && <div className="candy-status-tag">Your Listing</div>}
      <LiqImage
        alt={order?.name}
        src={order?.nftImageLink}
        fit="cover"
        style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
      />
      <div className="candy-order-info">
        {order?.nftAnimationLink?.includes('ext=mp4') && <IconPlayer className="candy-order-player-icon" />}
        <div className="candy-order-name-container">
          <div className="candy-order-name candy-line-limit-1">
            {`${order?.name}${order?.edition === 0 || order?.edition === null ? '' : `#${order?.edition}`}`}
          </div>
          {order.verifiedNftCollection ? <NftVerification /> : null}
        </div>
        <div className="candy-order-ticker candy-line-limit-1">{order?.ticker}</div>
        <div className="candy-order-price candy-line-limit-1">
          {orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}
        </div>
      </div>
    </div>
  );
};
