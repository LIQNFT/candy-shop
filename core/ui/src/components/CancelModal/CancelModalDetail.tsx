import { BlockchainType, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, Order as OrderSchema } from '@liqnft/candy-shop-types';

import { ExplorerLink } from 'components/ExplorerLink';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';
import { ShopExchangeInfo } from 'model';
import React from 'react';
import { getBlockChain } from 'utils/getBlockchain';
import { getPrice } from 'utils/getPrice';

export interface CancelModalDetailProps {
  order: OrderSchema;
  cancel: () => void;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
}

export const CancelModalDetail: React.FC<CancelModalDetailProps> = ({
  order,
  cancel,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  candyShopEnv,
  explorerLink
}) => {
  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);
  const blockchain = getBlockChain(candyShopEnv);
  const [contractAddress, tokenId] = order.tokenMint.split(':');

  return (
    <div className="candy-cancel-modal">
      <div className="candy-cancel-modal-thumbnail">
        <Viewer order={order} />
      </div>

      <div className="candy-cancel-modal-container">
        <div className="candy-cancel-title">
          <div className="candy-title">{order.name}</div>
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-cancel-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          <button className="candy-button candy-cancel-modal-button" onClick={cancel}>
            Cancel listing
          </button>
        </div>
        {order?.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order.nftDescription}</div>
          </div>
        )}
        <div className="candy-stat-horizontal">
          <div>
            <div className="candy-label">{blockchain === BlockchainType.EVM ? 'CONTRACT ADDRESS' : 'MINT ADDRESS'}</div>
            <div className="candy-value">
              <div className="candy-value">
                {
                  <ExplorerLink
                    type="address"
                    address={contractAddress}
                    candyShopEnv={candyShopEnv}
                    explorerLink={explorerLink}
                  />
                }
              </div>
            </div>
          </div>
          <div className="candy-stat-horizontal-line" />
          {tokenId && (
            <div>
              <div className="candy-label">TOKEN ID</div>
              <div className="candy-value">{tokenId}</div>
            </div>
          )}
          {order?.edition ? (
            <>
              <div className="candy-stat-horizontal-line" />
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
            </>
          ) : null}
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">CURRENT OWNER</div>
            <div className="candy-value">
              <ExplorerLink
                type="address"
                address={order.walletAddress}
                candyShopEnv={candyShopEnv}
                explorerLink={explorerLink}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
