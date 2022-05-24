import React, { useState, useEffect } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, fetchAuctionsByShopAddress } from '@liqnft/candy-shop-sdk';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'components/Skeleton';
import { Card } from 'components/Card';
import { AuctionModal } from 'components/AuctionModal';

interface AuctionsProps {
  wallet?: AnchorWallet;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  candyShop: CandyShop;
}

export const Auctions: React.FC<AuctionsProps> = ({ walletConnectComponent, wallet, candyShop }) => {
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState<any>();
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const loadNextPage = () => {
    // handle load next
  };

  const onCloseModal = () => {
    setSelected(false);
  };

  useEffect(() => {
    if (!candyShop) return;

    fetchAuctionsByShopAddress(candyShop.candyShopAddress.toString())
      .then((data: any) => {
        console.log(data);
      })
      .catch((error: any) => {
        console.log(error);
      });

    setTimeout(() => {
      setNfts(Array.from({ length: 5 }));
      setHasNextPage(false);
    }, 3_000);
  }, [candyShop]);

  return (
    <div className="candy-container">
      <InfiniteScroll
        dataLength={nfts.length}
        next={loadNextPage}
        hasMore={hasNextPage}
        loader={
          <div className="candy-container-list">
            {Array(4)
              .fill(0)
              .map((_, key) => (
                <div key={key}>
                  <Skeleton />
                </div>
              ))}
          </div>
        }
      >
        <div className="candy-container-list">
          {nfts.map((order, index) => (
            <Card
              onClick={() => setSelected(ORDER)}
              key={index}
              name={ORDER.name}
              ticker={ORDER.symbol}
              imgUrl={ORDER.nftImageLink}
              label={
                index % 2 === 0 ? (
                  <div className="candy-status-tag">HIGHEST BID</div>
                ) : (
                  <div className="candy-status-tag candy-status-tag-gray">Outbid</div>
                )
              }
              footer={
                <div className="candy-card-footer">
                  <div className="candy-card-stat">Current Bid: 25 SOL</div>
                  <div className="candy-card-stat">Ends In: 16 hours</div>
                </div>
              }
            />
          ))}
        </div>
      </InfiniteScroll>

      {selected ? (
        <AuctionModal
          order={selected}
          onClose={onCloseModal}
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={walletConnectComponent}
        />
      ) : null}
    </div>
  );
};

const ORDER = {
  name: 'Mirror #3457',
  symbol: 'MIRROR',
  nftImageLink: 'https://storage.mirrorworld.fun/nft/3457.png',
  tokenMint: '3FJLJ3vUrFyLeRQthnY3okkexb13ey86vUJ1hhBFr1bj',
  tokenAccount: '9YXHf5hGqETBJADjJ14YPbkCCC7ryk2ntdAVr24QUsKJ',
  nftDescription:
    'Mirrors is a collection of 11,000 unique AI Virtual Beings. Each Mirror can be upgraded and co-create narratives by talking with the collector, also offering a series of rights in the future games.'
};
