import React from 'react';
import { web3 } from '@project-serum/anchor';
import { shortenAddress } from 'utils/helperFunc';
import { ExplorerLinkBase, BlockchainType } from '@liqnft/candy-shop-sdk';
import { Blockchain } from '@liqnft/candy-shop-types';
import { getBlockChain } from 'utils/getBlockchain';

export const BaseUrlType = {
  [ExplorerLinkBase.SolScan]: 'https://solscan.io',
  [ExplorerLinkBase.SolanaFM]: 'https://solana.fm',
  [ExplorerLinkBase.Explorer]: 'https://explorer.solana.com',
  [ExplorerLinkBase.Polygon]: 'https://polygonscan.com',
  [ExplorerLinkBase.Mumbai]: 'https://mumbai.polygonscan.com',
  [ExplorerLinkBase.Eth]: 'https://etherscan.io',
  [ExplorerLinkBase.Goerli]: 'https://goerli.etherscan.io'
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
  const blockchain = getBlockChain(candyShopEnv);

  let aLink = '';

  if (blockchain === BlockchainType.SOL) {
    aLink = `${BaseUrlType[explorerLink || ExplorerLinkBase.Explorer]}/${type}/${address}${getClusterQuery(
      candyShopEnv,
      explorerLink || ExplorerLinkBase.Explorer
    )}`;
  } else {
    switch (candyShopEnv) {
      case Blockchain.Eth:
        aLink = `${BaseUrlType[ExplorerLinkBase.Eth]}/${type}/${address}`;
        break;
      case Blockchain.EthTestnet:
        aLink = `${BaseUrlType[ExplorerLinkBase.Goerli]}/${type}/${address}`;
        break;
      case Blockchain.Polygon:
        aLink = `${BaseUrlType[ExplorerLinkBase.Polygon]}/${type}/${address}`;
        break;
      case Blockchain.PolygonTestnet:
        aLink = `${BaseUrlType[ExplorerLinkBase.Mumbai]}/${type}/${address}`;
    }
  }

  if (!address) return null;
  const addressString = typeof address === 'string' ? address : address?.toBase58();

  return (
    <div className="candy-link">
      <a href={aLink} target="_blank" rel="noreferrer noopener" title={addressString}>
        {children || shortenAddress(addressString, length)}
      </a>
    </div>
  );
};
