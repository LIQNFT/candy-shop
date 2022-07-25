import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'components/Search';
import { CandyShop, fetchAllShop } from '@liqnft/candy-shop-sdk';
import { LoadStatus } from 'constant';
import { ListBase, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';
import { Processing } from 'components/Processing';
import { ShopFilter as ShopFilterInfo } from 'model';
import { removeDuplicate } from 'utils/array';

import '../../style/order-filter.less';

interface ShopFilterProps {
  onChange: (item: CandyShopResponse | ShopFilterInfo | undefined, type: 'auto' | 'manual') => any;
  selected?: CandyShopResponse;
  candyShop: CandyShop;
  filters?: ShopFilterInfo[] | boolean;
  selectedManual?: ShopFilterInfo;
  showAllFilters: boolean;
  search?: boolean;
}

const Logger = 'CandyShopUI/ShopFilter';
const LIMIT = 10;

export const ShopFilter: React.FC<ShopFilterProps> = ({
  onChange,
  selected,
  candyShop,
  filters,
  selectedManual,
  showAllFilters,
  search
}) => {
  const [options, setOptions] = useState<CandyShopResponse[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [haveNext, setHaveNext] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>();

  const onSearch = useCallback((keyword: string) => {
    setKeyword(keyword);
    setOffset(0);
  }, []);

  const fetchOption = useCallback(
    (startIndex: number) => {
      if (!candyShop) return;
      setLoading(LoadStatus.Loading);
      const queryDto = {
        offset: startIndex,
        limit: LIMIT,
        shopId: candyShop.candyShopAddress.toString(),
        name: keyword
      };
      fetchAllShop(queryDto)
        .then((res: ListBase<CandyShopResponse>) => {
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
            return removeDuplicate<CandyShopResponse>(list, result, 'candyShopAddress');
          });
        })
        .catch((err: Error) => console.log(`${Logger} fetchAllCollection error=`, err))
        .finally(() => setLoading(LoadStatus.Loaded));
    },
    [candyShop, keyword]
  );

  useEffect(() => {
    if (offset !== 0 || Array.isArray(filters)) return;
    fetchOption(0);
  }, [fetchOption, filters, offset]);

  // Manual filter
  const filteredList = useMemo(() => {
    if (!Array.isArray(filters)) return [];
    if (!keyword) return filters;

    const keywordList = keyword.toLowerCase().split(' ');
    return filters.filter((item) => {
      const name = (item.name as string).toLowerCase();
      return keywordList.some((word) => name.includes(word));
    });
  }, [filters, keyword]);

  if (Array.isArray(filters)) {
    return (
      <>
        <div className="candy-filter-subtitle">Shops</div>
        {search && <Search onSearch={onSearch} placeholder="Search shops" />}
        {selected ? (
          <div className="candy-filter-selected-name">
            {selected.candyShopName}
            <span className="close-icon" onClick={onChange(undefined, 'manual')} />
          </div>
        ) : null}
        <ul>
          {!showAllFilters && (
            <li key="All" onClick={onChange(undefined, 'manual')} className={selectedManual ? '' : 'selected'}>
              All
            </li>
          )}
          {filteredList.map((filter) => (
            <li
              key={filter.name}
              className={selectedManual?.shopId === filter.shopId ? 'selected' : ''}
              onClick={onChange(filter, 'manual')}
            >
              {filter.name}
            </li>
          ))}
        </ul>
      </>
    );
  }

  const disableLoadMore = !haveNext || loading === LoadStatus.Loading;

  return (
    <div className="candy-collection-filter">
      <div className="candy-filter-subtitle">Shops</div>
      {search && <Search onSearch={onSearch} placeholder="Search shops" />}
      {selected ? (
        <div className="candy-filter-selected-name">
          {selected.candyShopName}
          <span className="close-icon" onClick={onChange(undefined, 'auto')} />
        </div>
      ) : null}
      <ul className="candy-filter-options">
        {options.map((item) => (
          <li
            key={item.candyShopAddress}
            onClick={onChange(item, 'auto')}
            className={selected === item ? 'selected' : ''}
          >
            {item.candyShopName}
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
