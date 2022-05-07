import React from 'react';

import { web3 } from '@project-serum/anchor';
import { formatDate } from 'utils/format';
import { Auction } from '@liqnft/candy-shop-types';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';

// import { CandyShop } from '@liqnft/candy-shop-sdk';

interface AuctionModalConfirmedProps {
  order: Auction;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  onClose: () => void;
  // candyShop: CandyShop;
}

const AuctionModalConfirmed: React.FC<AuctionModalConfirmedProps> = ({
  order,
  txHash,
  walletPublicKey,
  onClose
  // candyShop
}) => {
  const walletAddress = walletPublicKey?.toBase58();

  return (
    <div className="candy-auction-modal-confirmed">
      <div className="candy-auction-modal-confirmed-header">
        <IconTick />
        <div>Transaction Confirmed</div>
      </div>

      <div className="candy-auction-modal-confirmed-container">
        <div className="candy-auction-modal-confirmed-thumbnail">
          <LiqImage src={order?.image || ''} alt={order?.name} fit="contain" />
        </div>
        <div className="candy-auction-modal-confirmed-content">
          <div>
            <div className="candy-auction-modal-name">{order?.name}</div>
            <div className="candy-auction-modal-ticker">{order?.symbol}</div>
          </div>
          {/* <div>
            <div className="candy-auction-modal-price">{bidPriceContent}</div>
          </div> */}
        </div>
      </div>

      <hr />

      <div className="candy-auction-modal-confirmed-flex">
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">FROM</div>
          <div className="candy-value">
            <ExplorerLink type="address" address={order.sellerAddress} />
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">{walletAddress && <ExplorerLink type="address" address={walletAddress} />}</div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink type="tx" address={txHash} />
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">CONFIRMED ON</div>
          <div className="candy-value">{formatDate(new Date())}</div>
        </div>
      </div>

      <button className="candy-button" onClick={onClose}>
        Continue Shopping
      </button>
    </div>
  );
};

export default AuctionModalConfirmed;
