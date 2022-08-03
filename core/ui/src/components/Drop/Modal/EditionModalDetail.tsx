import React from 'react';

import { Drop, DropStatus } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';

import { Price } from 'components/Price';
import { CandyShop } from '@liqnft/candy-shop-sdk';

export interface EditionModalDetailProps {
  dropNft: Drop;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  onMint: () => void;
  candyShop: CandyShop;
}

export const EditionModalDetail: React.FC<EditionModalDetailProps> = ({
  dropNft,
  walletPublicKey,
  walletConnectComponent,
  candyShop,
  onMint
}) => {
  const percentage = ((dropNft.currentSupply || 0) / dropNft.maxSupply) * 100;

  return (
    <>
      <div className="candy-edition-modal-thumbnail">
        <img src={dropNft.nftImage} alt={dropNft.nftName} />
      </div>
      <div className="candy-edition-modal-container">
        <div className="candy-edition-modal-header">
          <div className="title">TOTAL SUPPLY</div>
          <div className="title">AVAILABLE TOKENS</div>
          <b className="bold">{percentage}%</b>
          <b className="bold">{dropNft.maxSupply}</b>
          <div className="candy-edition-slide">
            <div className="background-slide" />
            <div className="slide" style={{ width: `${percentage}%` }} />
          </div>
          <div className="decimal">
            {' '}
            {dropNft.currentSupply} / {dropNft.maxSupply}
          </div>
        </div>
        <div className="candy-title">{dropNft.nftName}</div>
        <div className="candy-edition-modal-control">
          <div className="candy-edition-mint-price">
            <div className="candy-label">MINT PRICE</div>
            <div className="candy-price">{<Price candyShop={candyShop} value={dropNft.price} />}</div>
          </div>
          {walletPublicKey ? (
            <div className="candy-edition-price-modal">
              <div className="candy-input-price">
                <input disabled placeholder="Enter number of quantity" min={0} value="1" type="number" step="any" />
              </div>

              <button
                disabled={
                  !(dropNft.status === DropStatus.SALE_STARTED || dropNft.status === DropStatus.WHITELIST_STARTED)
                }
                onClick={onMint}
                className="candy-button candy-edition-modal-button"
              >
                Mint NFT
              </button>
            </div>
          ) : (
            walletConnectComponent
          )}
        </div>
        {dropNft.description && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{dropNft.description}</div>
          </div>
        )}
      </div>
    </>
  );
};
