import React from 'react';
import { web3 } from '@project-serum/anchor';
import { shortenAddress } from 'utils/helperFunc';
import { ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain } from '@liqnft/candy-shop-types';

export const BaseUrlType = {
  [ExplorerLinkBase.SolScan]: 'https://solscan.io',
  [ExplorerLinkBase.SolanaFM]: 'https://solana.fm',
  [ExplorerLinkBase.Explorer]: 'https://explorer.solana.com',
  [ExplorerLinkBase.Polygon]: 'https://mumbai.polygonscan.com'
};

const getClusterQuery = (network: string | undefined, baseUrl: ExplorerLinkBase) => {
  if (network !== 'devnet') return '';
  if (baseUrl === ExplorerLinkBase.SolanaFM) return '?cluster=devnet-qn1';
  return `?cluster=devnet`;
};

interface ExplorerLinkProps {
  address: string | web3.PublicKey;
  type: string;
  length?: number;
  children?: React.ReactNode;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
}

export const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  type,
  children,
  length = 4,
  address,
  candyShopEnv,
  explorerLink
}) => {
  const source = explorerLink || ExplorerLinkBase.Explorer; // TODO: update source for ETh
  if (!address) return null;
  const addressString = typeof address === 'string' ? address : address?.toBase58();

  return (
    <div className="candy-link">
      <a
        href={`${BaseUrlType[source]}/${type}/${address}${getClusterQuery(candyShopEnv, source)}`}
        target="_blank"
        rel="noreferrer noopener"
        title={addressString}
      >
        {children || shortenAddress(addressString, length)}
      </a>
    </div>
  );
};
