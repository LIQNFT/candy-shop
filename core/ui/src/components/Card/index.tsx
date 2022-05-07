import React, { ReactElement } from 'react';

import { LiqImage } from 'components/LiqImage';

import './index.less';

export interface CardProps {
  label?: ReactElement | boolean;
  onClick?: () => void;
  imgUrl: string;
  name?: string;
  ticker?: string;
}

export const Card: React.FC<CardProps> = ({ onClick, label, imgUrl, name, ticker }) => {
  return (
    <div className="candy-card-border candy-card" onClick={onClick}>
      {label}
      <LiqImage src={imgUrl} alt={name} />
      <div className="candy-card-info">
        <div className="name">{name}</div>
        <div className="ticker">{ticker}</div>
      </div>
    </div>
  );
};
