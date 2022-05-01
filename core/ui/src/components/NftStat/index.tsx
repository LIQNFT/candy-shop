import React from 'react';
import { ExplorerLink } from 'components/ExplorerLink';

export interface NftStatProps {
  tokenMint: string;
  edition?: number | string | null;
  owner?: string;
}

export const NftStat: React.FC<NftStatProps> = ({ tokenMint, edition, owner }) => {
  return (
    <div className="candy-stat-horizontal">
      <div>
        <div className="candy-label">MINT ADDRESS</div>
        <div className="candy-value">
          <ExplorerLink type="address" address={tokenMint} />
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
              <ExplorerLink type="address" address={owner} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
