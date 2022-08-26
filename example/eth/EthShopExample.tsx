import React, { useMemo, useEffect, useState } from 'react';
import { EthCandyShop } from '../../core/sdk';
import { ethers, providers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const EthShopExample: React.FC = () => {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState('');

  const candyShop = useMemo(() => {
    let candyShop: any = null;
    try {
      candyShop = new EthCandyShop({
        candyShopCreatorAddress: 'TestShop',
        treasuryMint: 'ETH',
        env: 'goerli'
      });
    } catch (err) {
      console.log(`CandyShop: create instance failed, error=`, err);
    }

    console.log(candyShop);

    return candyShop;
  });

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal]);

  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: 'TODO'
        }
      }
    };

    const newWeb3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true, // very important
      providerOptions
    });

    setWeb3Modal(newWeb3Modal);
  }, []);

  async function connectWallet() {
    const provider = await web3Modal.connect();
    const ethersProvider = new providers.Web3Provider(provider);
    const userAddress = await ethersProvider.getSigner().getAddress();
    setAddress(userAddress);
  }

  async function disconnectWallet() {
    await web3Modal.clearCachedProvider();
    setAddress('');
  }

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <h1>Eth Candy Shop</h1>
      {address ? (
        <>
          <p>{address}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect wallet</button>
      )}
    </div>
  );
};
