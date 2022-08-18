import React, { useState } from 'react';
import { web3 } from '@project-serum/anchor';
import { shortenAddress } from 'utils/helperFunc';
import { IconSolanaFM } from 'assets/IconSolanaFM';

export enum BaseUrlType {
  SolScan = 'https://solscan.io',
  SolFM = 'https://solana.fm',
  Explorer = 'https://explorer.solana.com'
}

const getClusterQuery = (network: string | undefined, baseUrl: BaseUrlType) => {
  if (network !== 'devnet') return '';
  if (baseUrl === BaseUrlType.SolFM) return '?cluster=devnet-qn1';
  return `?cluster=devnet`;
};

export const ExplorerLink = (props: {
  address: string | web3.PublicKey;
  type: string;
  style?: React.CSSProperties;
  length?: number;
  children?: React.ReactNode;
  href?: string;
  baseUrl?: BaseUrlType;
}): JSX.Element | null => {
  const { type, children, baseUrl = BaseUrlType.Explorer } = props;

  const [network] = useState(() => {
    const form = JSON.parse(localStorage.getItem('LS_CANDY_FORM') || '');
    console.log('form.network', form.network);
    if (form) return form.network;
  });

  const address = typeof props.address === 'string' ? props.address : props.address?.toBase58();

  if (!address) {
    return null;
  }

  const length = props.length ?? 4;

  return (
    <div className="candy-link">
      <a
        href={`${BaseUrlType.SolFM}/${type}/${address}${getClusterQuery(network, BaseUrlType.SolFM)}`}
        target="_blank"
        rel="noreferrer noopener"
        title={address}
        style={props.style}
      >
        <IconSolanaFM />
      </a>
      <a
        href={`${baseUrl}/${type}/${address}${getClusterQuery(network, baseUrl)}`}
        target="_blank"
        rel="noreferrer noopener"
        title={address}
        style={props.style}
      >
        {children || shortenAddress(address, length)}
      </a>
    </div>
  );
};
