import React from 'react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { IconPlayer } from 'assets/IconPlayer';
import { LiqImage } from 'components/LiqImage';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { getExchangeInfo } from 'utils/getExchangeInfo';
import { getPrice } from 'utils/getPrice';
import './index.less';

export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  url?: string;
  candyShop: CandyShop;
  sellerUrl?: string;
  onOrderSelection: (order?: OrderSchema) => void;
}

export const Order: React.FC<OrderProps> = ({ order, wallet, url, candyShop, onOrderSelection }) => {
  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
      return;
    }
    onOrderSelection(order);
  };

  const exchangeInfo = getExchangeInfo(order, candyShop);
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order.price, exchangeInfo);
  const isUserListing = wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();

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
            {`${order?.name}${order?.edition !== 0 ? ` #${order?.edition}` : ''}`}
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
