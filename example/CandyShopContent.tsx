import { web3 } from '@project-serum/anchor';
import { WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { CandyShop, fetchShopByCreatorAddress } from '../core/sdk/.';
import { Activity, defaultExchangeInfo, OrderDetail, Orders, Sell, Stat } from '../core/ui/.';
import { ShopExchangeInfo } from '../core/ui/dist/model';
import { CANDY_SHOP_PROGRAM_ID, CREATOR_ADDRESS, TREASURY_MINT } from './constant/publicKey';

interface CandyShopContentProps {
  network: web3.Cluster;
}

export const CandyShopContent: React.FC<CandyShopContentProps> = ({ network }) => {
  const [treasuryMint] = useState(new web3.PublicKey(TREASURY_MINT));
  const [candyShop, setCandyShop] = useState<CandyShop>();

  const wallet = useAnchorWallet();

  const [exchangeInfoMap, setExchangeInfoMap] = useState<Map<string, ShopExchangeInfo>>(
    new Map([[TREASURY_MINT, defaultExchangeInfo]])
  );

  useEffect(() => {
    if (!treasuryMint || !network) return;
    setCandyShop(
      new CandyShop(
        new web3.PublicKey(CREATOR_ADDRESS),
        treasuryMint,
        new web3.PublicKey(CANDY_SHOP_PROGRAM_ID),
        network,
        {
          mainnetConnectionUrl: 'https://ssc-dao.genesysgo.net/'
        }
      )
    );
  }, [treasuryMint, network]);

  useEffect(() => {
    fetchShopByCreatorAddress(new web3.PublicKey(CREATOR_ADDRESS)).then((data) => {
      if (!data.success) return;
      const newExchangeInfoMap: Map<string, ShopExchangeInfo> = new Map();
      data.result.forEach((shop) => {
        newExchangeInfoMap.set(shop.treasuryMint, {
          symbol: shop.symbol,
          decimals: shop.decimals,
          logoURI: shop.logoURI
        });
      });
      setExchangeInfoMap((prevMap) => new Map([...prevMap, ...newExchangeInfoMap]));
    });
  }, [fetchShopByCreatorAddress]);

  if (!candyShop) return null;

  return (
    <div style={{ paddingBottom: 50, textAlign: 'center' }}>
      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>

      <div style={{ marginBottom: 50 }}>
        <Stat
          title={'Marketplace'}
          description={
            'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'
          }
          candyShop={candyShop}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>
        Orders with SellAddress: 3ftivZofYPfWuRYwgWaSbinB9XVFYSVYmB65mjmKCqoe
      </h1>
      <div>
        <Orders
          wallet={wallet}
          walletConnectComponent={<WalletMultiButton />}
          filters={FILTERS}
          candyShop={candyShop}
          sellerAddress={'3ftivZofYPfWuRYwgWaSbinB9XVFYSVYmB65mjmKCqoe'}
        />
      </div>

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Order Detail</h1>
      <OrderDetail
        tokenMint={'EVdLAk8GeWRsj2HpyBujG1pJPip5gjkPcZ76QinsHHtJ'}
        backUrl={'/'}
        walletConnectComponent={<WalletMultiButton />}
        wallet={wallet}
        candyShop={candyShop}
      />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 30 }}>Sell</h1>
      <Sell wallet={wallet} candyShop={candyShop} walletConnectComponent={<WalletMultiButton />} />

      <h1 style={{ textAlign: 'center', fontWeight: 'bold', margin: '80px 0 30px' }}>Activity</h1>
      <Activity candyShop={candyShop} />
    </div>
  );
};

const FILTERS = [
  { name: 'Puppies', identifier: 2036309415 },
  { name: 'Smilies', identifier: -38328789 },
  { name: 'Puppies + Smilies', identifier: [-38328789, 2036309415] }
];
