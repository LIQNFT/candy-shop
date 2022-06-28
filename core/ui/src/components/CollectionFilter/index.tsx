import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CandyShop, fetchAllCollection, fetchCollectionByShopAddress } from '@liqnft/candy-shop-sdk';
import { ListBase, NftCollection } from '@liqnft/candy-shop-types';
import { Processing } from 'components/Processing';
import { CollectionFilter as CollectionFilterType } from 'model';
import { Search } from 'components/Search';
import { removeDuplicate } from 'utils/array';
import { LoadStatus } from 'constant';
import '../../style/order-filter.less';

interface CollectionFilterProps {
  onChange: (item: NftCollection | CollectionFilterType | undefined, type: 'auto' | 'manual') => any;
  selected?: NftCollection;
  candyShop: CandyShop;
  filters?: CollectionFilterType[] | boolean;
  selectedManual?: CollectionFilterType;
  shopId?: string;
  showAllFilters: boolean;
}

const Logger = 'CandyShopUI/Collection';
const LIMIT = 10;

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
  onChange,
  selected,
  candyShop,
  filters,
  selectedManual,
  shopId,
  showAllFilters
}) => {
  const [options, setOptions] = useState<NftCollection[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [haveNext, setHaveNext] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>();
  const [previousShopId, setPreviousShopId] = useState<string | undefined>(shopId);

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
        shopId: shopId || candyShop.candyShopAddress.toString(),
        name: keyword
      };
      if (shopId) return fetchCollectionByShopAddress(queryDto);
      return fetchAllCollection(queryDto);
    },
    [candyShop, keyword, shopId]
  );

  const fetchOption = useCallback(
    (startIndex: number) => {
      if (!candyShop) return;
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
    [candyShop, getFetchCollectionAPI]
  );

  useEffect(() => {
    if (offset !== 0 || Array.isArray(filters)) return;
    fetchOption(0);
  }, [fetchOption, filters, offset]);

  // Manual filter
  const filteredList: CollectionFilterType[] = useMemo(() => {
    if (!Array.isArray(filters)) return [];
    if (!keyword) return filters;

    const keywordList = keyword.split(' ');
    return filters.filter((item) => {
      const name = (item.name as string).toLowerCase();
      return keywordList.some((word) => name.includes(word));
    });
  }, [filters, keyword]);

  // Manual filter
  if (Array.isArray(filters)) {
    return (
      <>
        <div className="candy-filter-title">By Collection</div>
        <ul>
          <Search onSearch={onSearch} placeholder="Search collections" />
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
      <div className="candy-filter-title">By Collection</div>
      <Search onSearch={onSearch} placeholder="Search collections" />
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
