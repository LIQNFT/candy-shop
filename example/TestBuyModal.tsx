import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Order as OrderSchema } from '../core/types';
import { BuyModal, getExchangeInfo } from '../core/ui/.';

export const TestBuyModal = ({ candyShop, style }) => {
  const wallet = useAnchorWallet();

  const [orders, setOrders] = useState<OrderSchema[]>([]);
  const [selection, setSelection] = useState<OrderSchema>();

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    setSelection(orders[0]);
  };

  useEffect(() => {
    candyShop
      .orders({})
      .then((res) => {
        console.log(res);
        if (!res.success) {
          message.error('Something went wrong!');
          return;
        }
        setOrders(res.result);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [candyShop]);

  const exchangeInfo = getExchangeInfo(orders[0], candyShop);

  return (
    <>
      {orders[0] && (
        <Button type="primary" onClick={onClick} style={style}>
          Show BuyModal Test
        </Button>
      )}

      {selection && (
        <BuyModal
          order={orders[0]}
          onClose={onClose}
          wallet={wallet}
          walletConnectComponent={<WalletMultiButton />}
          exchangeInfo={exchangeInfo}
          shopAddress={candyShop.candyShopAddress}
          candyShopProgramId={candyShop.programId}
          connection={candyShop.connection()}
          isEnterprise={candyShop.isEnterprise}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
        />
      )}
    </>
  );
};
