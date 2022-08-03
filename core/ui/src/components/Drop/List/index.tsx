import React, { useState, useRef, useEffect } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchDropsByShopAddress } from '@liqnft/candy-shop-sdk';
import { Drop, ListBase } from '@liqnft/candy-shop-types';

import { Card } from 'components/Card';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { EditionModal } from '../Modal';

import { IconVault } from 'assets/IconVault';
import { DropFilter, FILTERS } from 'constant/drop';

import { useObserver } from 'hooks/useObserver';
import { LoadStatus } from 'constant';
import { removeDuplicate } from 'utils/helperFunc';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { getDropLabel } from 'utils/getDropLabel';
import { DropFooter } from './DropFooter';
dayjs.extend(duration);
import './style.less';
import { Search } from 'components/Search';

interface DropsProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  filter?: boolean;
  search?: boolean;
  creator?: string;
}

const Logger = 'CandyShopUI/Drops';

export const Drops: React.FC<DropsProps> = ({ candyShop, wallet, walletConnectComponent, filter, search, creator }) => {
  const [dropNft, setDropNft] = useState<Drop>();
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [dropNfts, setDropNfts] = useState<Drop[]>();
  const [filterOption, setFilterOption] = useState<DropFilter>(FILTERS[0]);
  const [keyword, setKeyword] = useState<string>();

  const [target, setTarget] = useState<HTMLDivElement>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const dropQueries = useRef({ offset: 0, limit: 12 });
  const prevFilterRef = useRef(filterOption);

  useEffect(() => {
    if (prevFilterRef.current !== filterOption || keyword !== undefined) {
      prevFilterRef.current = filterOption;
      dropQueries.current.offset = 0;
      setHasMore(true);
      setDropNfts(undefined);
    }
  }, [filterOption, keyword]);

  const fetchDrops = () => {
    if (hasMore === false) return;
    setLoading(LoadStatus.Loading);
    fetchDropsByShopAddress(candyShop.candyShopAddress.toString(), {
      offset: dropQueries.current.offset,
      limit: dropQueries.current.limit,
      status: filterOption.value,
      nftMint: keyword,
      creator
    })
      .then((res: ListBase<Drop>) => {
        const { offset, result, totalCount } = res;

        if (!res.success) {
          console.log(`${Logger} fetchDropsByShopAddress error=`, res.msg);
          setHasMore(false);
          setDropNfts(undefined);
          return;
        }
        setHasMore(offset + result.length < totalCount);
        dropQueries.current = { ...dropQueries.current, offset: offset + dropQueries.current.limit };
        setDropNfts((list) => removeDuplicate<Drop>(list, result, 'txHashAtCreation'));
        if (offset + result.length < totalCount && target && target.getBoundingClientRect().top > 0) {
          fetchDrops();
        }
      })
      .catch((err) => {
        console.log(`${Logger} fetchDropsByShopAddress error=`, err);
        setHasMore(false);
        setDropNfts(undefined);
      })
      .finally(() => {
        setLoading(LoadStatus.Loaded);
      });
  };

  useObserver({ callbackFn: fetchDrops, triggerTargetId: 'DROP_TARGET', enable: Boolean(target && hasMore) });

  const onClickCard = (item: any) => () => setDropNft(item);

  const onSearchDrop = (name: string) => setKeyword(name);

  return (
    <div className="candy-container">
      <div className="candy-drop-header">
        {filter && (
          <div className="candy-edition-filter">
            {FILTERS.map((item) => (
              <div
                key={item.label}
                onClick={() => setFilterOption(item)}
                className={filterOption === item ? 'active' : ''}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
        {search && <Search onSearch={onSearchDrop} placeholder="Search Drops" />}
      </div>

      <div className="candy-container-list">
        {dropNfts?.map((nft) => {
          return (
            <Card
              className="candy-edition-card"
              imgUrl={nft.nftImage}
              key={nft.txHashAtCreation}
              onClick={onClickCard(nft)}
              label={
                <div>
                  <span className="candy-status-tag" id={`drop-tag-${nft.txHashAtCreation}`}>
                    {getDropLabel(nft)}
                  </span>
                  <div className="candy-edition-vault-icon">
                    <IconVault />
                  </div>
                </div>
              }
              footer={<DropFooter candyShop={candyShop} nft={nft} />}
            />
          );
        })}
      </div>
      <div id="DROP_TARGET" ref={(target: HTMLDivElement) => setTarget(target)} />
      {loading === LoadStatus.Loading && <LoadingSkeleton />}
      {dropNft ? (
        <EditionModal
          onClose={() => setDropNft(undefined)}
          walletConnectComponent={walletConnectComponent}
          wallet={wallet}
          dropNft={dropNft}
          candyShop={candyShop}
        />
      ) : null}
    </div>
  );
};
