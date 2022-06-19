import React, { useState } from 'react';

import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';

import { getExchangeInfo } from 'utils/getExchangeInfo';
import { getPrice } from 'utils/getPrice';

import { LiqImage } from 'components/LiqImage';
import { BuyModal } from 'components/BuyModal';
import { CancelModal } from 'components/CancelModal';
import { IconPlayer } from 'assets/IconPlayer';

import './index.less';

export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  url?: string;
  candyShop: CandyShop;
}

export const Order: React.FC<OrderProps> = ({ order, wallet, walletConnectComponent, url, candyShop }) => {
  const [selection, setSelection] = useState<OrderSchema>();
  const [orderCandyShop, setOrderCandyShop] = useState<CandyShop>(candyShop);

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    if (url) {
      window.location.href = url.replace(':tokenMint', order.tokenMint);
    } else {
      setOrderCandyShop(
        new CandyShop({
          candyShopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
          treasuryMint: new web3.PublicKey(order.treasuryMint),
          candyShopProgramId: candyShop.programId,
          env: candyShop.env,
          settings: candyShop.settings
        })
      );

      setSelection(order);
    }
  };

  const exchangeInfo = getExchangeInfo(order, candyShop);
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order, exchangeInfo);
  const isUserListing = wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();

  return (
    <>
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
          <div className="candy-order-name candy-line-limit-1">
            {`${order?.name}${order?.edition !== 0 ? ` #${order?.edition}` : ''}`}
          </div>
          <div className="candy-order-ticker candy-line-limit-1">{order?.ticker}</div>
          <div className="candy-order-price candy-line-limit-1">
            {orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}
          </div>
        </div>
      </div>

      {selection && !isUserListing ? (
        <BuyModal
          order={selection}
          onClose={onClose}
          wallet={wallet}
          walletConnectComponent={walletConnectComponent}
          exchangeInfo={exchangeInfo}
          shopAddress={candyShop.candyShopAddress}
          candyShopProgramId={candyShop.programId}
          connection={candyShop.connection()}
          isEnterprise={candyShop.isEnterprise}
          candyShopVersion={candyShop.version}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
        />
      ) : null}

      {selection && isUserListing && wallet ? (
        <CancelModal
          onClose={onClose}
          candyShop={orderCandyShop}
          order={selection}
          wallet={wallet}
          exchangeInfo={exchangeInfo}
        />
      ) : null}
    </>
  );
};
