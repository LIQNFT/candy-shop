import React from 'react';
import CreateShop from './eth/shop/CreateShop';
import UpdateShop from './eth/shop/UpdateShop';
import GetShop from './eth/shop/GetShop';
import DeleteShop from './eth/shop/DeleteShop';
import Buy from './eth/order/Buy';
import Sell from './eth/order/Sell';
import Cancel from './eth/order/Cancel';
import GetOrder from './eth/order/GetOrder';
import Consumption from './eth/signature/Consumption';
import BuyerAllowance from './eth/signature/BuyerAllowance';
import SellerAllowance from './eth/signature/SellerAllowance';

interface EthExampleProps {
  candyShop: CandyShop;
}

export const EthExample: React.FC<EthExampleProps> = ({ candyShop }) => {
  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <h1>Eth Candy Shop</h1>
      <CreateShop />
      <UpdateShop />
      <GetShop />
      <DeleteShop />
      <Sell />
      <Buy />
      <Cancel />
      <GetOrder />
      <Consumption />
      <SellerAllowance />
      <BuyerAllowance />
    </div>
  );
};
