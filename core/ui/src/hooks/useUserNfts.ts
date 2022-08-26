import { safeAwait, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { CandyShop as CandyShopResponse, Order, Trade } from '@liqnft/candy-shop-types';

import { LoadStatus } from 'constant';
import { EventName } from 'constant/SocketEvent';
import { ShopProps } from 'model';
import { useSocket } from 'public/Context/Socket';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShopDataFactory } from 'services/shopData';
import { removeListeners } from 'utils/helperFunc';
import { notification, NotificationType } from 'utils/rc-notification';

export enum ShopDataErrorType {
  GetShop = 'GetShop',
  GetNFTs = 'GetNFTs',
  GetOrderNfts = 'GetOrderNfts'
}

interface UseSellResponse {
  shop?: CandyShopResponse;
  nfts: SingleTokenInfo[];
  sellOrders: Record<string, Order>;
  loading: LoadStatus;
}
interface UseSellOptions {
  enableCacheNFT?: boolean;
}
const Logger = 'CandyShopUI/Sell-Service';

const useUserNfts = (
  { blockchain, candyShop, wallet }: ShopProps,
  { enableCacheNFT }: UseSellOptions
): UseSellResponse => {
  const shopData = useMemo(() => ShopDataFactory({ blockchain, candyShop, wallet }), [blockchain, candyShop, wallet]);

  const { onSocketEvent } = useSocket();

  const [shop, setShop] = useState<CandyShopResponse>();
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [sellOrders, setSellOrders] = useState<Record<string, Order>>({});

  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);

  const publicKey = wallet?.publicKey?.toString();

  const getNfts = useCallback(
    async (publicKey: string) => {
      const shop = await safeAwait(shopData.getShop());
      if (shop.error) {
        shop.error.name = ShopDataErrorType.GetShop;
        throw shop.error;
      }

      const nfts = await safeAwait(
        shopData.getNFTs(publicKey, { enableCacheNFT, allowSellAnyNft: shop.result.allowSellAnyNft })
      );
      if (nfts.error) {
        nfts.error.name = ShopDataErrorType.GetNFTs;
        throw nfts.error;
      }

      return {
        shop: shop.result,
        nfts: nfts.result
      };
    },
    [enableCacheNFT, shopData]
  );

  const getOrderNfts = useCallback(
    async (publicKey: string) => {
      const orderNfts = await safeAwait(shopData.getOrderNfts(publicKey));
      if (orderNfts.error) {
        orderNfts.error.name = ShopDataErrorType.GetOrderNfts;
        throw orderNfts.error;
      }

      return orderNfts.result;
    },
    [shopData]
  );

  useEffect(() => {
    if (!publicKey) return;
    setLoading(LoadStatus.Loading);

    Promise.all([getNfts(publicKey), getOrderNfts(publicKey)])
      .then(([{ shop, nfts }, sellOrders]) => {
        setShop(shop);
        setNfts(nfts);
        setSellOrders(
          sellOrders.reduce((acc: Record<string, Order>, item: Order) => {
            acc[item.tokenMint] = item;
            return acc;
          }, {})
        );
      })
      .catch((error: Error) => {
        notification(error.message, NotificationType.Error);
        console.log(`${Logger}: ${error.name} failed, error=`, error);
      })
      .finally(() => {
        setLoading(LoadStatus.Loaded);
      });
  }, [getNfts, getOrderNfts, publicKey]);

  useEffect(() => {
    const controllers = [
      onSocketEvent(EventName.orderOpened, (order: Order) => {
        setSellOrders((list) => ({ ...list, [order.tokenMint]: order }));
      }),
      onSocketEvent(EventName.orderCanceled, (order: { tokenMint: string }) => {
        setSellOrders((list) => {
          const newList: Record<string, Order> = {};
          for (const key in list) {
            if (key !== order.tokenMint) {
              newList[key] = list[key];
            }
          }
          return newList;
        });
      })
    ];

    return () => removeListeners(controllers);
  }, [onSocketEvent]);

  useEffect(() => {
    if (!publicKey) return;
    const controller = onSocketEvent(EventName.traded, (data: Trade) => {
      if (data.buyerAddress === publicKey) {
        shopData.getNFTs(publicKey, { enableCacheNFT });
      }
    });
    return () => controller.abort();
  }, [onSocketEvent, publicKey, shopData, enableCacheNFT]);

  return {
    shop,
    nfts,
    sellOrders,
    loading
  };
};

export default useUserNfts;
