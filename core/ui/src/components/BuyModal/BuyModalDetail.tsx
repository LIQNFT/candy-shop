import React, { useEffect, useState } from 'react';
import { fetchNFTByMintAddress } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';
import { ShopExchangeInfo } from 'model';
import { getPrice } from 'utils/getPrice';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
}

export const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl
}) => {
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft>();

  useEffect(() => {
    setLoadingNftInfo(true);

    fetchNFTByMintAddress(order.tokenMint)
      .then((nft: Nft) => setNftInfo(nft))
      .catch((error: Error) => {
        console.info('fetchNftByMint failed:', error);
      })
      .finally(() => {
        setLoadingNftInfo(false);
      });
  }, [order.tokenMint]);

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

  return (
    <>
      <div className="candy-buy-modal-thumbnail">
        <Viewer order={order} />
      </div>
      <div className="candy-buy-modal-container">
        <div className="candy-buy-modal-title">
          {order?.name}
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          {!walletPublicKey ? (
            walletConnectComponent
          ) : (
            <button className="candy-button candy-buy-modal-button" onClick={buy}>
              Buy Now
            </button>
          )}
        </div>
        {order.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
        )}
        <NftStat
          owner={order.walletAddress}
          tokenMint={order.tokenMint}
          edition={order.edition}
          sellerUrl={sellerUrl}
        />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />
      </div>
    </>
  );
};
