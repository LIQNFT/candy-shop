import React from 'react';
import './style.less';

interface AuctionNftHeaderProps {
  name?: string;
  imgUrl: string;
  ticker?: string;
  edition?: string | number;
}

export const AuctionNftHeader: React.FC<AuctionNftHeaderProps> = ({ name, imgUrl, ticker, edition }) => {
  return (
    <div className="candy-auction-nft-header">
      <img src={imgUrl} alt={name} />
      <div>
        <div className="candy-auction-nft-header-name">
          {name}
          {edition && ` #${edition}`}
        </div>
        <div className="candy-auction-nft-header-ticker">{ticker}</div>
      </div>
    </div>
  );
};
