import React from 'react';
import { ExplorerLink } from 'components/ExplorerLink';
import { shortenAddress } from 'utils/helperFunc';
import { Blockchain, CandyShop, EthCandyShop } from '@liqnft/candy-shop-sdk';
import { CommonChain, EthWallet } from 'model';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface NftStatType<C, S, W> extends CommonChain<C, S, W> {
  tokenMint: string;
  edition?: number | string | null;
  owner?: string;
  sellerUrl?: string;
}
type NftStatProps =
  | NftStatType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | NftStatType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const NftStat: React.FC<NftStatProps> = ({ tokenMint, edition, owner, sellerUrl, ...chainProps }) => {
  return (
    <div className="candy-stat-horizontal">
      <div>
        <div className="candy-label">MINT ADDRESS</div>
        <div className="candy-value">
          <ExplorerLink type="address" address={tokenMint} {...chainProps} />
        </div>
      </div>
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
                <ExplorerLink type="address" address={owner} {...chainProps} />
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
