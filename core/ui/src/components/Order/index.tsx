import { CandyShop } from '@liqnft/candy-shop-sdk';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { BuyModal } from 'components/BuyModal';
import { CancelModal } from 'components/CancelModal';
import { LiqImage } from 'components/LiqImage';
import { defaultExchangeInfo } from 'constant/Order';
import { ShopExchangeInfo } from 'model';
import React, { useMemo, useState } from 'react';
import { Order as OrderSchema } from 'solana-candy-shop-schema/dist';
import { getPrice } from 'utils/getPrice';
import './index.less';

export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  url?: string;
  candyShop: CandyShop;
  exchangeInfoMap?: Map<string, ShopExchangeInfo>;
}

export const Order: React.FC<OrderProps> = ({
  order,
  wallet,
  walletConnectComponent,
  url,
  candyShop,
  exchangeInfoMap
}) => {
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
        new CandyShop(
          new web3.PublicKey(order.candyShopCreatorAddress),
          new web3.PublicKey(order.treasuryMint),
          candyShop.programId,
          candyShop.env,
          candyShop.settings
        )
      );

      setSelection(order);
    }
  };

  const shopExchangeInfo = useMemo<ShopExchangeInfo>(() => {
    if (!exchangeInfoMap || !exchangeInfoMap.has(order.treasuryMint)) {
      return defaultExchangeInfo;
    }

    return {
      symbol: exchangeInfoMap.get(order.treasuryMint)?.symbol || 'SOL',
      decimals: exchangeInfoMap.get(order.treasuryMint)?.decimals || 9,
      logoURI:
        exchangeInfoMap.get(order.treasuryMint)?.logoURI ||
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    };
  }, [exchangeInfoMap, order]);

  const isUserListing = wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();
  const orderPrice = getPrice(candyShop, order, shopExchangeInfo);

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
          <div className="candy-order-name candy-line-limit-1">
            {`${order?.name}${order?.edition !== 0 ? ` #${order?.edition}` : ''}`}
          </div>
          <div className="candy-order-ticker candy-line-limit-1">{order?.ticker}</div>
          <div className="candy-order-price candy-line-limit-1">
            {orderPrice ? `${orderPrice} ${shopExchangeInfo.symbol}` : 'N/A'}
          </div>
        </div>
      </div>

      {!isUserListing && selection ? (
        <BuyModal
          order={selection}
          onClose={onClose}
          wallet={wallet}
          candyShop={orderCandyShop}
          walletConnectComponent={walletConnectComponent}
          shopExchangeInfo={shopExchangeInfo}
        />
      ) : null}

      {isUserListing && selection && wallet ? (
        <CancelModal
          onClose={onClose}
          candyShop={orderCandyShop}
          order={selection}
          wallet={wallet}
          shopExchangeInfo={shopExchangeInfo}
        />
      ) : null}
    </>
  );
};
