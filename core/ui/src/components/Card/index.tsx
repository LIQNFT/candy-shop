import React, { ReactElement } from 'react';

import { LiqImage } from 'components/LiqImage';

import './index.less';

export interface CardProps {
  label?: ReactElement;
  onClick?: () => void;
  imgUrl: string;
  name?: string;
  ticker?: string;
  footer?: ReactElement;
}

export const Card: React.FC<CardProps> = ({ onClick, label, imgUrl, name, ticker, footer }) => {
  return (
    <div className="candy-card-border candy-card" onClick={onClick}>
      {label}
      <LiqImage src={imgUrl} alt={name} />
      <div className="candy-card-info">
        <div className="name">{name}</div>
        <div className="ticker">{ticker}</div>
        {footer}
      </div>
    </div>
  );
};
