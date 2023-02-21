import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCollectionByShopAddress } from '@liqnft/candy-shop-sdk';
import { ListBase, NftCollection } from '@liqnft/candy-shop-types';
import { Processing } from 'components/Processing';
import { CollectionFilter as CollectionFilterModel } from 'model';
import { Search } from 'components/Search';
import { removeDuplicate } from 'utils/helperFunc';
import { LoadStatus } from 'constant';
import { handleError } from 'utils/ErrorHandler';
import * as Popover from '@radix-ui/react-popover';
import { IconFilter } from 'assets/IconFilter';
import { Show } from 'components/Show';
import '../../style/order-filter.less';

export type FilterType = 'list' | 'dropdown';

interface CollectionFilterProps {
  onChange: (item: NftCollection | CollectionFilterModel | undefined, type: 'auto' | 'manual') => any;
  selected?: NftCollection;
  filters?: CollectionFilterModel[] | boolean | 'auto';
  selectedManual?: CollectionFilterModel;
  search?: boolean;
  candyShopAddress?: string;
  filterType?: FilterType;
}

const Logger = 'CandyShopUI/Collection';
const LIMIT = 10;

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
  onChange,
  selected,
  filters,
  selectedManual,
  search,
  candyShopAddress,
  filterType
}) => {
  const [options, setOptions] = useState<NftCollection[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [haveNext, setHaveNext] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>();

  const onSearch = useCallback((keyword: string) => {
    setKeyword(keyword);
    setOffset(0);
  }, []);

  const getFetchCollectionAPI = useCallback(
    (startIndex: number, candyShopAddress: string) => {
      const queryDto = {
        offset: startIndex,
        limit: LIMIT,
        shopId: candyShopAddress,
        name: keyword
      };
      return fetchCollectionByShopAddress(queryDto);
    },
    [keyword]
  );

  const fetchOption = useCallback(
    (startIndex: number) => {
      if (!candyShopAddress) return;
      setLoading(LoadStatus.Loading);
      getFetchCollectionAPI(startIndex, candyShopAddress)
        .then((res: ListBase<NftCollection>) => {
          const { result, offset, totalCount, count } = res;
          setHaveNext(offset + count < totalCount);
          setOffset((startIndex) => startIndex + LIMIT);
          setOptions((list) => {
            if (offset === 0) return result || [];
            return removeDuplicate<NftCollection>(list, result, 'id');
          });
        })
        .catch((err: Error) => {
          setHaveNext(false);
          setOptions([]);
          handleError(err);
          console.log(`${Logger} fetchAllCollection error=`, err);
        })
        .finally(() => setLoading(LoadStatus.Loaded));
    },
    [candyShopAddress, getFetchCollectionAPI]
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

  const onTogglePopover = (open: boolean) => {
    if (open === false) {
      setOffset(0);
      setKeyword('');
    }
  };

  const disableLoadMore = !haveNext || loading === LoadStatus.Loading;

  // Manual filter
  if (Array.isArray(filters)) {
    // Manual filter with dropdown type
    if (filterType === 'dropdown') {
      return (
        <div>
          <Popover.Root onOpenChange={onTogglePopover}>
            <Popover.Trigger asChild>
              <div className="candy-filter-collection-trigger">
                <IconFilter /> Collections
              </div>
            </Popover.Trigger>
            <Popover.Content className="candy-filter-collection-content" sideOffset={5}>
              <Search onSearch={onSearch} placeholder="Search collections" />
              <ul className="candy-filter-options">
                {filters.map((item) => (
                  <Popover.Close key={item.name}>
                    <li
                      onClick={onChange(item, 'manual')}
                      className={selectedManual?.name === item.name ? 'selected' : ''}
                      title={item.name}
                    >
                      {item.name}
                    </li>
                  </Popover.Close>
                ))}
              </ul>

              <Popover.Arrow className="PopoverArrow" />
            </Popover.Content>
          </Popover.Root>
          <Show when={Boolean(selectedManual)}>
            <div className="candy-filter-selected-name">
              {selectedManual?.name}
              <span className="close-icon" onClick={onChange(undefined, 'manual')} />
            </div>
          </Show>
        </div>
      );
    }

    // Manual filter with list type
    return (
      <>
        <div className="candy-filter-subtitle">Collections</div>
        <Show when={search}>
          <Search onSearch={onSearch} placeholder="Search collections" />
        </Show>
        <Show when={Boolean(selectedManual)}>
          <div className="candy-filter-selected-name">
            {selectedManual?.name}
            <span className="close-icon" onClick={onChange(undefined, 'manual')} />
          </div>
        </Show>
        <ul>
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

  // Auto view
  // Auto filter with dropdown type
  if (filterType === 'dropdown') {
    return (
      <div>
        <Popover.Root onOpenChange={onTogglePopover}>
          <Popover.Trigger asChild>
            <div className="candy-filter-collection-trigger">
              <IconFilter /> Collections
            </div>
          </Popover.Trigger>
          <Popover.Content className="candy-filter-collection-content" sideOffset={5}>
            <Search onSearch={onSearch} placeholder="Search collections" />
            <ul className="candy-filter-options">
              {options.map((item) => (
                <Popover.Close key={item.id}>
                  <li onClick={onChange(item, 'auto')} className={selected?.id === item.id ? 'selected' : ''}>
                    {item.name}
                  </li>
                </Popover.Close>
              ))}
            </ul>
            <Show when={loading === LoadStatus.Loading}>
              <Processing />
            </Show>
            <Show when={!disableLoadMore}>
              <button className="candy-filter-load" type="button" onClick={() => fetchOption(offset)}>
                + Load more
              </button>
            </Show>

            <Popover.Arrow className="PopoverArrow" />
          </Popover.Content>
        </Popover.Root>
        <Show when={Boolean(selected)}>
          <div className="candy-filter-selected-name">
            {selected?.name}
            <span className="close-icon" onClick={onChange(undefined, 'auto')} />
          </div>
        </Show>
      </div>
    );
  }

  // Auto filter with list type
  return (
    <div className="candy-collection-filter">
      <div className="candy-filter-subtitle">Collections</div>
      <Show when={search}>
        <Search onSearch={onSearch} placeholder="Search collections" />
      </Show>
      <Show when={Boolean(selected)}>
        <div className="candy-filter-selected-name">
          {selected?.name}
          <span className="close-icon" onClick={onChange(undefined, 'auto')} />
        </div>
      </Show>

      <ul className="candy-filter-options">
        {options.map((item) => (
          <li key={item.id} onClick={onChange(item, 'auto')} className={selected === item ? 'selected' : ''}>
            {item.name}
          </li>
        ))}
      </ul>
      <Show when={loading === LoadStatus.Loading}>
        <Processing />
      </Show>

      <Show when={!disableLoadMore}>
        <button
          className={`candy-filter-load ${disableLoadMore ? 'candy-filter-load-disable' : ''}`}
          onClick={() => fetchOption(offset)}
        >
          + Load more
        </button>
      </Show>
    </div>
  );
};
