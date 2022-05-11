import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Dropdown } from 'components/Dropdown';
import { Empty } from 'components/Empty';
import { Skeleton } from 'components/Skeleton';
import { InfiniteOrderList } from 'components/InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ORDER_FETCH_LIMIT, LOADING_SKELETON_COUNT, SORT_OPTIONS } from 'constant/Orders';
import { OrdersActionsStatus } from 'constant';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from 'hooks/useValidateStatus';
import { useUpdateCandyShopContext } from 'public/Context';
import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { awaitTransactionSignatureConfirmation } from '@liqnft/candy-shop-sdk';

import './index.less';

interface OrdersProps {
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  url?: string;
  identifiers?: number[];
  filters?: Array<{ name: string; identifier: number | Array<number> }>;
  style?: { [key: string]: string | number } | undefined;
  defaultFilterName?: string;
  candyShop: CandyShop;
}

const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletConnectComponent,
  wallet,
  url,
  identifiers,
  filters,
  style,
  defaultFilterName,
  candyShop
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [filterName, setFilterName] = useState<string | undefined>(undefined);
  const [filterIdentifiers, setFilterIdentifiers] = useState<number[] | undefined>(() => {
    if (filters && defaultFilterName) {
      const defaultFilter = filters.find((filter) => filter.name === defaultFilterName);
      if (defaultFilter !== undefined) {
        return Array.isArray(defaultFilter.identifier) ? defaultFilter.identifier : [defaultFilter.identifier];
      }
    }
  });
  const loadingMountRef = useRef(false);

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

  const getUniqueIdentifiers = useCallback(() => {
    const uniqueIdentifiers = [...(identifiers || []), ...(filterIdentifiers || [])];

    return [...new Set(uniqueIdentifiers)];
  }, [filterIdentifiers, identifiers]);

  const loadNextPage = (startIndex: number, limit: number) => () => {
    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: startIndex,
          limit
        },
        getUniqueIdentifiers()
      )
      .then((data: any) => {
        if (!data.result) return;
        if (data.offset + data.count >= data.totalCount) {
          setHasNextPage(false);
        } else {
          setHasNextPage(true);
        }
        setStartIndex((startIndex) => startIndex + limit);
        setOrders((existingOrders) => [...existingOrders, ...data.result]);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      });
  };

  useEffect(() => {
    if (!loadingMountRef.current) {
      setLoading(true);
    }
    loadingMountRef.current = true;

    candyShop
      .orders(
        {
          sortBy: sortedByOption.value,
          offset: 0,
          limit: ORDER_FETCH_LIMIT
        },
        getUniqueIdentifiers()
      )
      .then((data: any) => {
        if (!data.result) return;
        const haveNextPage = data.offset + data.count < data.totalCount;
        setHasNextPage(haveNextPage);
        setStartIndex(() => 0 + ORDER_FETCH_LIMIT);
        setOrders(data.result);
      })
      .catch((err) => {
        console.log('fetchOrdersByStoreId failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
    //updateOrderStatus to update
  }, [candyShop, getUniqueIdentifiers, sortedByOption.value, updateOrderStatus]);

  useEffect(() => {
    if (!wallet?.publicKey || !wallet?.signTransaction) return;
    (async () => {
      // get route map
      // const indexedRouteMapResult = await axios
      //   .get('https://quote-api.jup.ag/v1/indexed-route-map')
      //   .catch((err) => console.log({ err }));

      // if (!indexedRouteMapResult) return;

      // const { indexedRouteMap = {}, mintKeys = [] } = indexedRouteMapResult.data;

      // const routeMap = Object.keys(indexedRouteMap).reduce((routeMap, key) => {
      //   routeMap.set(
      //     mintKeys[Number(key)],
      //     indexedRouteMap[key].map((index: number) => mintKeys[index])
      //   );
      //   return routeMap;
      // }, new Map<string, string[]>());

      // const isSwappable = routeMap.get(USDC_ADDRESS)?.includes(SOL_ADDRESS);
      const isSwappable = true;

      if (isSwappable) {
        const tx = await axios.get(
          `https://quote-api.jup.ag/v1/quote?inputMint=${SOL_ADDRESS}&outputMint=${USDC_ADDRESS}&amount=${
            1 * 10 ** 9
          }&slippage=0.5`
        );

        const routes = tx.data;
        console.log({ routes });

        const transactions = await axios
          .post(
            'https://quote-api.jup.ag/v1/swap',
            { route: routes.data[0], userPublicKey: wallet.publicKey.toString() },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then((res) => Object.values(res.data))
          .catch((err) => console.log(err));

        console.log({ transactions });
        // const connection = candyShop.connection();
        transactions?.filter(Boolean).forEach(async (serializedTransaction: any) => {
          try {
            // get transaction object from serialized transaction
            const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));

            console.log({ serializedTransaction });
            const signedTx = await wallet.signTransaction(transaction);

            // const connection = (await candyShop.getStaticProgram(wallet)).provider.connection;
            const txHash = await awaitTransactionSignatureConfirmation(candyShop.connection(), signedTx.serialize());
            console.log({ txHash });
            console.log(`https://solscan.io/txHash/${txHash}`);
          } catch (err) {
            console.log(err);
          }
        });
      }
    })();
  }, [candyShop, wallet?.publicKey]);

  const loadingView = (
    <div className="candy-container-list">
      {Array(LOADING_SKELETON_COUNT)
        .fill(0)
        .map((_, key) => (
          <div key={key}>
            <Skeleton />
          </div>
        ))}
    </div>
  );

  const emptyView = <Empty description="No orders found" />;

  const infiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      wallet={wallet}
      url={url}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage(startIndex, ORDER_FETCH_LIMIT)}
      candyShop={candyShop}
    />
  );

  if (filters) {
    return (
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort candy-orders-sort-right">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </div>
          <div className="candy-orders-filter">
            <div className="candy-filter">
              <div className="candy-filter-title">Filter by Collection</div>
              <ul className="candy-filter-by-collection">
                <li
                  onClick={() => {
                    setFilterIdentifiers(undefined);
                    setFilterName(undefined);
                  }}
                  key={'All'}
                  className={!filterIdentifiers ? 'selected' : undefined}
                >
                  All
                </li>
                {filters.map((filter) => {
                  const filterArr = Array.isArray(filter.identifier) ? filter.identifier : [filter.identifier];

                  return (
                    <li
                      onClick={() => {
                        setFilterIdentifiers(filterArr);
                        setFilterName(filter.name);
                      }}
                      key={filter.name}
                      className={filterName === filter.name ? 'selected' : undefined}
                    >
                      {filter.name}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="candy-orders-content">
              {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
            />
          </div>
          {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
        </div>
      </div>
    </>
  );
};

const getPossiblePairsTokenInfo = ({
  tokens,
  routeMap,
  inputToken
}: {
  tokens: any[];
  routeMap: Map<string, string[]>;
  inputToken?: any;
}) => {
  try {
    const possiblePairs = routeMap.get(inputToken.address);
    const possiblePairsTokenInfo: { [key: string]: any | undefined } = {};
    possiblePairs &&
      possiblePairs.forEach((address) => {
        possiblePairsTokenInfo[address] = tokens.find((t) => {
          return t.address == address;
        });
      });

    return possiblePairsTokenInfo;
  } catch (error) {
    throw error;
  }
};
