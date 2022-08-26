import React, { useCallback, useMemo, useState } from 'react';
import { Empty } from 'components/Empty';
import { Nft } from 'components/Nft';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { LoadStatus } from 'constant';
import { ShopProps } from '../../model';
import { BlockchainType, CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { CancelModal } from 'components/CancelModal';
import { SellModal } from 'components/SellModal';
import { getExchangeInfo } from 'utils/getExchangeInfo';
import { Order } from '@liqnft/candy-shop-types';
import { SellerFactory } from 'services/seller';
import { CancelerFactory } from 'services/canceler';
import useUserNfts from 'hooks/useUserNfts';

interface SellProps extends ShopProps {
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
  enableCacheNFT?: boolean;
}

enum ModalType {
  SELL,
  CANCEL
}

export const Sell: React.FC<SellProps> = ({
  walletConnectComponent,
  style,
  enableCacheNFT,
  blockchain,
  candyShop,
  wallet
}) => {
  const {
    loading: loadingSell,
    nfts,
    sellOrders,
    shop
  } = useUserNfts({ candyShop, blockchain, wallet }, { enableCacheNFT });
  const seller = useMemo(
    () => SellerFactory({ blockchain: blockchain, candyShop, wallet, shop }),
    [blockchain, candyShop, shop, wallet]
  );
  const canceler = useMemo(
    () => CancelerFactory({ blockchain: blockchain, candyShop, wallet }),
    [blockchain, candyShop, wallet]
  );

  const [nftSelection, setNftSelection] = useState<SingleTokenInfo>();
  const [visibleModal, setVisibleModal] = useState<ModalType>();

  const getTokenMetadataByMintAddress = useCallback(
    (mintAddress: string) => {
      if (candyShop.blockchain === BlockchainType.Solana) {
        return seller.getTokenMetadataByMintAddress(mintAddress, (candyShop as CandyShop).connection);
      }

      return Promise.reject('getTokenMetadataByMintAddress no impl');
    },
    [candyShop, seller]
  );

  const sellNft = useCallback(
    async (nft: SingleTokenInfo, price: number) => {
      if (candyShop.blockchain === BlockchainType.Ethereum) {
        return seller.sell(nft, price, undefined);
      }

      if (candyShop.blockchain === BlockchainType.Solana) {
        const payload = {
          shopAddress: candyShop.candyShopAddress,
          baseUnitsPerCurrency: candyShop.baseUnitsPerCurrency,
          shopCreatorAddress: candyShop.candyShopCreatorAddress,
          shopTreasuryMint: candyShop.treasuryMint,
          candyShopProgramId: candyShop.programId
        };

        return seller.sell(nft, price, payload);
      }

      return Promise.reject('Blockchain no impl');
    },
    [candyShop, seller]
  );

  const cancelOrder = (order: Order) => {
    return canceler.cancel(order);
  };

  const onClose = () => {
    setNftSelection(undefined);
    setVisibleModal(undefined);
  };

  const handleClickNft = (nft: SingleTokenInfo, isListing: boolean) => () => {
    setNftSelection(nft);
    setVisibleModal(isListing ? ModalType.CANCEL : ModalType.SELL);
  };

  if (!wallet?.publicKey) {
    return (
      <div className="candy-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  const loading = loadingSell !== LoadStatus.Loaded;
  const sellDetail = nftSelection && sellOrders[nftSelection.tokenMintAddress];

  const exchangeInfo = getExchangeInfo(sellDetail, candyShop);

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {loading ? <LoadingSkeleton /> : null}
        {!loading && nfts.length && shop ? (
          <div className="candy-container-list">
            {nfts.map((item) => (
              <div
                key={item.tokenMintAddress}
                onClick={handleClickNft(item, Boolean(sellOrders[item.tokenMintAddress]))}
              >
                <Nft nft={item} sellDetail={sellOrders[item.tokenMintAddress]} />
              </div>
            ))}
          </div>
        ) : null}
        {!loading && nfts.length === 0 && <Empty description="No NFTs found" />}
      </div>

      {visibleModal === ModalType.SELL && nftSelection && shop && (
        <SellModal
          onCancel={onClose}
          nft={nftSelection}
          shop={shop}
          wallet={wallet}
          candyShopEnv={candyShop.env}
          currencySymbol={candyShop.currencySymbol}
          explorerLink={candyShop.explorerLink}
          getTokenMetadataByMintAddress={getTokenMetadataByMintAddress}
          sell={sellNft}
        />
      )}

      {visibleModal === ModalType.CANCEL ? (
        <CancelModal
          publicKey={wallet?.publicKey.toString()}
          onClose={onClose}
          order={sellDetail}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
          candyShopEnv={candyShop.env}
          explorerLink={candyShop.explorerLink}
          cancelOrder={cancelOrder}
        />
      ) : null}
    </div>
  );
};
