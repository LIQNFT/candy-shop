import React from 'react';
import { IconCandyShopOutlined } from 'assets/IconCandyShopOutlined';

import './style.less';

export const PoweredByInBuyModal: React.FC = () => {
  return (
    <a
      className="candy-powered-by-buy"
      href="https://candyshop.space/?utm_source=CandyShops&utm_medium=Button&utm_campaign=Site&utm_id=CandyShop"
      target="_blank"
      rel="noreferrer noopener"
    >
      POWERED BY
      <IconCandyShopOutlined />
    </a>
  );
};
