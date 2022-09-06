import React from 'react';
import { formatDate } from 'utils/timer';
import { Auction } from '@liqnft/candy-shop-types';
import { ExplorerLink } from 'components/ExplorerLink';
import { LiqImage } from 'components/LiqImage';
import IconTick from 'assets/IconTick';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { CommonChain, EthWallet } from 'model';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface AuctionModalConfirmedType<C, S, W> extends CommonChain<C, S, W> {
  auction: Auction;
  txHash: string;
  onClose: () => void;
  titleText: string;
  descriptionText?: string;
}
type AuctionModalConfirmedProps =
  | AuctionModalConfirmedType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | AuctionModalConfirmedType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const AuctionModalConfirmed: React.FC<AuctionModalConfirmedProps> = ({
  auction,
  txHash,
  onClose,
  titleText,
  descriptionText,
  ...chainProps
}) => {
  const walletAddress = chainProps.wallet?.publicKey.toString();

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
            <ExplorerLink {...chainProps} type="address" address={auction.sellerAddress} />
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TO</div>
          <div className="candy-value">
            {walletAddress && <ExplorerLink {...chainProps} type="address" address={walletAddress} />}
          </div>
        </div>
        <div className="candy-auction-modal-confirmed-item">
          <div className="candy-label">TRANSACTION HASH</div>
          <div className="candy-value">
            <ExplorerLink {...chainProps} type="tx" address={txHash} />
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
