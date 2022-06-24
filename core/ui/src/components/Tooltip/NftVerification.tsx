import React from 'react';
import { IconVerified } from 'assets/IconVerified';
import { Tooltip } from '.';

interface NftVerificationProps {
  size?: number;
}

export const NftVerification: React.FC<NftVerificationProps> = ({ size }) => {
  return (
    <Tooltip inner="Verified Collection">
      <IconVerified size={size} />
    </Tooltip>
  );
};
