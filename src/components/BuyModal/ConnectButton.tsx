import { useWallet } from '@solana/wallet-adapter-react';
import { Button, ButtonProps, Dropdown, Menu } from 'antd';
import React, { FC, useMemo } from 'react';
import { WalletConnectButton } from '@solana/wallet-adapter-ant-design/lib/WalletConnectButton';
import { WalletIcon } from '@solana/wallet-adapter-ant-design/lib/WalletIcon';
import { WalletModalButton } from '@solana/wallet-adapter-ant-design/lib/WalletModalButton';

interface LiqButtonProps extends ButtonProps {
  text?: string;
}

const ConnectButton: FC<LiqButtonProps> = ({
  type = 'primary',
  size = 'large',
  text = 'Connect',
  children,
  ...props
}) => {
  const { publicKey, wallet, disconnect } = useWallet();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  if (!wallet) {
    return (
      <WalletModalButton
        className="liq-wallet-button"
        type={type}
        size={size}
        {...props}
      >
        Connect wallet to buy
      </WalletModalButton>
    );
  }
  if (!base58) {
    return (
      <WalletConnectButton
        className="liq-wallet-button"
        type={type}
        size={size}
        {...props}
      >
        {children}
      </WalletConnectButton>
    );
  }

  return (
    <Dropdown
      overlay={
        <Menu className="wallet-adapter-multi-button-menu">
          <Menu.Item
            key="connect-button-dropdown-1"
            className="wallet-adapter-multi-button-menu-item"
          >
            <Button
              icon={<WalletIcon wallet={wallet} />}
              type={type}
              size={size}
              className="wallet-adapter-multi-button-menu-button"
              block
              {...props}
            >
              {wallet}
            </Button>
          </Menu.Item>
          <Menu.Item
            key="connect-button-dropdown-copy"
            onClick={async () => {
              await navigator.clipboard.writeText(base58);
            }}
            className="wallet-adapter-multi-button-item"
          >
            Copy address
          </Menu.Item>
          <Menu.Item
            key="connect-button-dropdown-disconnect"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              disconnect().catch(() => {
                // Silently catch because any errors are caught by the context `onError` handler
              });
            }}
            className="wallet-adapter-multi-button-item"
          >
            Disconnect
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
    ></Dropdown>
  );
};

export default ConnectButton;
