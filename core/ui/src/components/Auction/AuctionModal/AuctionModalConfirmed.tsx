import React from 'react';

import { web3 } from '@project-serum/anchor';
import { formatDate } from 'utils/timer';
import { Auction } from '@liqnft/candy-shop-types';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';
import { CandyShop } from '@liqnft/candy-shop-sdk';

interface AuctionModalConfirmedProps {
  auction: Auction;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  onClose: () => void;
  titleText: string;
  descriptionText?: string;
  candyShop: CandyShop;
}

export const AuctionModalConfirmed: React.FC<AuctionModalConfirmedProps> = ({
  auction,
  txHash,
  walletPublicKey,
  onClose,
  titleText,
  descriptionText,
  candyShop
}) => {
  const walletAddress = walletPublicKey?.toBase58();

  return (
    <div className="candy-auction-modal-confirmed">
      <div className="candy-auction-modal-confirmed-header">
        <IconTick />
        <div>{titleText}</div>
      </div>
      {descriptionText && <p className="candy-auction-modal-confirmed-description">{descriptionText}</p>}

      <div className="candy-auction-modal-confirmed-container">
        <div className="candy-auction-modal-confirmed-thumbnail">
          <LiqImage src={auction?.image || ''} alt={auction?.name} fit="contain" />
        </div>
        <div className="candy-auction-modal-confirmed-content">
          <div>
            <div className="candy-auction-modal-name">{auction?.name}</div>
            <div className="candy-auction-modal-ticker">{auction?.symbol}</div>
          </div>
        </div>
      </div>

      <hr />

      <div className="candy-auction-modal-confirmed-flex">
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink
              type="address"
              address={auction.sellerAddress}
              source={candyShop.explorerLink}
              env={candyShop.env}
            />
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">
            {walletAddress && (
              <ExplorerLink
                type="address"
                address={walletAddress}
                source={candyShop.explorerLink}
                env={candyShop.env}
              />
            )}
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} source={candyShop.explorerLink} env={candyShop.env} />
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </div>
      </div>

      <button className="candy-button" onClick={onClose}>
        Continue Browsing
      </button>
    </div>
  );
};
