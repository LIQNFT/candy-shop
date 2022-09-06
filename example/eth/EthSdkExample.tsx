import React from 'react';
import CreateShop from './shop/CreateShop';
import UpdateShop from './shop/UpdateShop';
import GetShop from './shop/GetShop';
import DeleteShop from './shop/DeleteShop';
import Buy from './order/Buy';
import Sell from './order/Sell';
import Cancel from './order/Cancel';
import GetOrder from './order/GetOrder';
import Consumption from './signature/Consumption';
import BuyerAllowance from './signature/BuyerAllowance';
import SellerAllowance from './signature/SellerAllowance';

export const EthSdkExample: React.FC = () => {
  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <h1>Eth SDK</h1>
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
