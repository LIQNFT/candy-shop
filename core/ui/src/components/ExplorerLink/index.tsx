import React from 'react';
import { web3 } from '@project-serum/anchor';
import { shortenAddress } from 'utils/format';

export const ExplorerLink = (props: {
  address: string | web3.PublicKey;
  type: string;
  style?: React.CSSProperties;
  length?: number;
}): JSX.Element | null => {
  const { type } = props;

  const address = typeof props.address === 'string' ? props.address : props.address?.toBase58();

  if (!address) {
    return null;
  }

  const length = props.length ?? 4;

  return (
    <a
      href={`https://explorer.solana.com/${type}/${address}`}
      target="_blank"
      rel="noreferrer noopener"
      title={address}
      style={props.style}
    >
      {shortenAddress(address, length)}
    </a>
  );
};
