import React from 'react';
import { ExplorerLink } from 'components/ExplorerLink';
import { shortenAddress } from 'utils/helperFunc';
import { BlockchainType, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain } from '@liqnft/candy-shop-types';
import { getBlockChain } from 'utils/getBlockchain';

interface NftStatProps {
  tokenMint: string;
  edition?: number | string | null;
  owner?: string;
  sellerUrl?: string;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
}

export const NftStat: React.FC<NftStatProps> = ({
  tokenMint,
  edition,
  owner,
  sellerUrl,
  candyShopEnv,
  explorerLink
}) => {
  const blockchain = getBlockChain(candyShopEnv);
  const [contractAddress, tokenId] = tokenMint.split(':');

  return (
    <div className="candy-stat-horizontal">
      <div>
        <div className="candy-label">
          {blockchain === BlockchainType.Ethereum ? 'CONTRACT ADDRESS' : 'MINT ADDRESS'}
        </div>
        <div className="candy-value">
          <ExplorerLink
            type="address"
            address={contractAddress}
            candyShopEnv={candyShopEnv}
            explorerLink={explorerLink}
          />
        </div>
      </div>
      {tokenId && (
        <>
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">TOKEN ID</div>
            <div className="candy-value">{tokenId}</div>
          </div>
        </>
      )}
      {edition && edition !== '0' ? (
        <>
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">EDITION</div>
            <div className="candy-value">{edition}</div>
          </div>
        </>
      ) : null}
      {owner ? (
        <>
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              {sellerUrl ? (
                <a
                  href={sellerUrl.replace('{{sellerAddress}}', owner)}
                  target="_blank"
                  rel="noreferrer noopener"
                  title="Seller profile"
                >
                  {shortenAddress(owner)}
                </a>
              ) : (
                <ExplorerLink type="address" address={owner} candyShopEnv={candyShopEnv} explorerLink={explorerLink} />
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
