import React from 'react';
import { IconCandyShop } from 'assets/IconCandyShop';
import './style.less';

export const PoweredBy: React.FC = () => {
  return (
    <a
      className="candy-powered-by"
      href="https://candyshop.space/?utm_source=CandyShops&utm_medium=Button&utm_campaign=Site&utm_id=CandyShop"
      target="_blank"
      rel="noreferrer noopener"
    >
      <IconCandyShop />
    </a>
  );
};
