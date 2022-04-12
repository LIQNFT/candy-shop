import { web3 } from '@project-serum/anchor';
import React from 'react';

// shorten the checksummed version of the input address to have 4 characters at start and end
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const ExplorerLink = (props: {
  address: string | web3.PublicKey;
  type: string;
  style?: React.CSSProperties;
  length?: number;
}): JSX.Element | null => {
  const { type } = props;

  const address =
    typeof props.address === 'string'
      ? props.address
      : props.address?.toBase58();

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
