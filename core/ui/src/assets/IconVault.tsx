import React from 'react';

interface IconVaultProps {
  fill?: string;
}

export const IconVault: React.FC<IconVaultProps> = ({ fill = '#757575' }) => {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 8H2C0.897 8 0 8.897 0 10V18C0 19.103 0.897 20 2 20H16C17.103 20 18 19.103 18 18V10C18 8.897 17.103 8 16 8ZM2 4H16V6H2V4ZM4 0H14V2H4V0Z"
        fill={fill}
      />
    </svg>
  );
};
