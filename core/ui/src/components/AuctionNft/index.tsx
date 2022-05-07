import React from 'react';
import './style.less';

interface AuctionNftProps {
  name: string;
  imgUrl: string;
  collection: string;
}

export const AuctionNft: React.FC<AuctionNftProps> = ({ name, imgUrl, collection }) => {
  return (
    <div className="candy-auction-nft">
      <img src={imgUrl} alt={name} />

      <div>
        <span>Collection</span>
        <p>NFT_name</p>
        <span>8/150</span>
      </div>
    </div>
  );
};
