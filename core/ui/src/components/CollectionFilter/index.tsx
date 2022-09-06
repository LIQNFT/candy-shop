import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Blockchain,
  CandyShop,
  EthCandyShop,
  fetchAllCollection,
  fetchCollectionByShopAddress
} from '@liqnft/candy-shop-sdk';
import { ListBase, NftCollection } from '@liqnft/candy-shop-types';
import { Processing } from 'components/Processing';
import { CollectionFilter as CollectionFilterModel, CommonChain, EthWallet } from 'model';
import { Search } from 'components/Search';
import { removeDuplicate } from 'utils/helperFunc';
import { LoadStatus } from 'constant';
import '../../style/order-filter.less';
import { AnchorWallet } from '@solana/wallet-adapter-react';

interface CollectionFilterType<C, S, W> extends CommonChain<C, S, W> {
  onChange: (item: NftCollection | CollectionFilterModel | undefined, type: 'auto' | 'manual') => any;
  selected?: NftCollection;
  // candyShop: CandyShop;
  filters?: CollectionFilterModel[] | boolean | 'auto';
  selectedManual?: CollectionFilterModel;
  shopId?: string;
  showAllFilters: boolean;
  search?: boolean;
}
type CollectionFilterProps =
  | CollectionFilterType<Blockchain.Solana, CandyShop, AnchorWallet>
  | CollectionFilterType<Blockchain.Ethereum, EthCandyShop, EthWallet>;

const Logger = 'CandyShopUI/Collection';
const LIMIT = 10;

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
  onChange,
  selected,
  filters,
  selectedManual,
  shopId,
  showAllFilters,
  search,
  ...chainProps
}) => {
  const [options, setOptions] = useState<NftCollection[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [haveNext, setHaveNext] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>();
  const [previousShopId, setPreviousShopId] = useState<string | undefined>(shopId);

  const candyShopAddress = chainProps.candyShop.candyShopAddress.toString();

  if (shopId !== previousShopId) {
    setPreviousShopId(shopId);
    setOffset(0);
  }

  const onSearch = useCallback((keyword: string) => {
    setKeyword(keyword);
    setOffset(0);
  }, []);

  const getFetchCollectionAPI = useCallback(
    (startIndex: number) => {
      const queryDto = {
        offset: startIndex,
        limit: LIMIT,
        shopId: shopId || candyShopAddress,
        name: keyword
      };
      if (shopId) return fetchCollectionByShopAddress(queryDto);
      return fetchAllCollection(queryDto);
    },
    [candyShopAddress, keyword, shopId]
  );

  const fetchOption = useCallback(
    (startIndex: number) => {
      if (!chainProps.candyShop) return;
      setLoading(LoadStatus.Loading);
      getFetchCollectionAPI(startIndex)
        .then((res: ListBase<NftCollection>) => {
          if (!res.success) {
            setHaveNext(false);
            setOptions([]);
            return;
          }
          const { result, offset, totalCount, count } = res;
          setHaveNext(offset + count < totalCount);
          setOffset((startIndex) => startIndex + LIMIT);
          setOptions((list) => {
            if (offset === 0) return result || [];
            return removeDuplicate<NftCollection>(list, result, 'id');
          });
        })
        .catch((err: Error) => console.log(`${Logger} fetchAllCollection error=`, err))
        .finally(() => setLoading(LoadStatus.Loaded));
    },
    [chainProps.candyShop, getFetchCollectionAPI]
  );

  useEffect(() => {
    if (offset !== 0 || Array.isArray(filters)) return;
    fetchOption(0);
  }, [fetchOption, filters, offset]);

  // Manual filter
  const filteredList: CollectionFilterModel[] = useMemo(() => {
    if (!Array.isArray(filters)) return [];
    if (!keyword) return filters;

    const keywordList = keyword.toLowerCase().split(' ');
    return filters.filter((item) => {
      const name = (item.name as string).toLowerCase();
      return keywordList.some((word) => name.includes(word));
    });
  }, [filters, keyword]);

  // Manual filter
  if (Array.isArray(filters)) {
    return (
      <>
        <div className="candy-filter-subtitle">Collections</div>
        <ul>
          {search && <Search onSearch={onSearch} placeholder="Search collections" />}
          {selectedManual ? (
            <div className="candy-filter-selected-name">
              {selectedManual.name}
              <span className="close-icon" onClick={onChange(undefined, 'manual')} />
            </div>
          ) : null}
          {!showAllFilters && (
            <li key="All" onClick={onChange(undefined, 'manual')} className={selectedManual ? '' : 'selected'}>
              All
            </li>
          )}
          {filteredList.map((filter) => {
            return (
              <li
                key={filter.name}
                className={selectedManual?.collectionId === filter.collectionId ? 'selected' : ''}
                onClick={onChange(filter, 'manual')}
              >
                {filter.name}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  const disableLoadMore = !haveNext || loading === LoadStatus.Loading;

  return (
    <div className="candy-collection-filter">
      <div className="candy-filter-subtitle">Collections</div>
      {search && <Search onSearch={onSearch} placeholder="Search collections" />}
      {selected ? (
        <div className="candy-filter-selected-name">
          {selected.name}
          <span className="close-icon" onClick={onChange(undefined, 'auto')} />
        </div>
      ) : null}
      <ul className="candy-filter-options">
        {options.map((item) => (
          <li key={item.id} onClick={onChange(item, 'auto')} className={selected === item ? 'selected' : ''}>
            {item.name}
          </li>
        ))}
        {loading === LoadStatus.Loading && <Processing />}
        <button
          disabled={disableLoadMore}
          className={`candy-filter-load ${disableLoadMore ? 'candy-filter-load-disable' : ''}`}
          onClick={() => fetchOption(offset)}
        >
          + Load more
        </button>
      </ul>
    </div>
  );
};
