import React from 'react';
import { formatDate } from 'utils/timer';
import { Auction, Blockchain } from '@liqnft/candy-shop-types';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';

interface AuctionModalConfirmedProps {
  auction: Auction;
  txHash: string;
  onClose: () => void;
  titleText: string;
  descriptionText?: string;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  walletAddress: string | undefined;
}

export const AuctionModalConfirmed: React.FC<AuctionModalConfirmedProps> = ({
  auction,
  txHash,
  onClose,
  titleText,
  descriptionText,
  walletAddress,
  candyShopEnv,
  explorerLink
}) => {
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
              candyShopEnv={candyShopEnv}
              explorerLink={explorerLink}
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
                candyShopEnv={candyShopEnv}
                explorerLink={explorerLink}
              />
            )}
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} candyShopEnv={candyShopEnv} explorerLink={explorerLink} />
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
