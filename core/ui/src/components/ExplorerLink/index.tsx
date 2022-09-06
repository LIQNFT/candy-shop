import React from 'react';
import { web3 } from '@project-serum/anchor';
import { shortenAddress } from 'utils/helperFunc';
import { Blockchain, CandyShop, EthCandyShop, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { CommonChain, EthWallet } from 'model';
import { AnchorWallet } from '@solana/wallet-adapter-react';

export const BaseUrlType = {
  [ExplorerLinkBase.SolScan]: 'https://solscan.io',
  [ExplorerLinkBase.SolanaFM]: 'https://solana.fm',
  [ExplorerLinkBase.Explorer]: 'https://explorer.solana.com'
};

const getClusterQuery = (network: string | undefined, baseUrl: ExplorerLinkBase) => {
  if (network !== 'devnet') return '';
  if (baseUrl === ExplorerLinkBase.SolanaFM) return '?cluster=devnet-qn1';
  return `?cluster=devnet`;
};

interface ExplorerLinkType<C, S, W> extends CommonChain<C, S, W> {
  address: string | web3.PublicKey;
  type: string;
  length?: number;
  children?: React.ReactNode;
}

type ExplorerLinkProps =
  | ExplorerLinkType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | ExplorerLinkType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const ExplorerLink: React.FC<ExplorerLinkProps> = (props) => {
  const { type, children, length = 4, address, candyShop, blockchain } = props;
  const env = blockchain === Blockchain.Solana ? candyShop.env : undefined;
  const source = blockchain === Blockchain.Solana ? candyShop.explorerLink : ExplorerLinkBase.Explorer; // TODO: update source for ETh
  if (!address) return null;
  const addressString = typeof address === 'string' ? address : address?.toBase58();
  return (
    <div className="candy-link">
      <a
        href={`${BaseUrlType[source]}/${type}/${address}${getClusterQuery(env, source)}`}
        target="_blank"
        rel="noreferrer noopener"
        title={addressString}
      >
        {children || shortenAddress(addressString, length)}
      </a>
    </div>
  );
};
