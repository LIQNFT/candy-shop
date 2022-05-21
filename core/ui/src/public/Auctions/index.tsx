import React, { useState, useEffect } from 'react';

import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';

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
    setTimeout(() => {
      setNfts(Array.from({ length: 5 }));
      setHasNextPage(false);
    }, 3_000);
  }, []);

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
              name="Auction nft"
              ticker="Ticker"
              imgUrl="https://bf3shfdg4einqbytuuofqvpjo2k3iawhuqeg4nud3i5wdrlram.arweave.net/CXcjlGbhENg_HE6UcWFXpdpW0AsekCG42g9o7YcVxA8?ext=jpeg"
              label={
                index % 2 === 0 ? (
                  <div className="candy-status-tag">HIGHEST BID</div>
                ) : (
                  <div className="candy-status-tag candy-status-tag-gray">Outbid</div>
                )
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
  name: 'Auction ticker',
  tokenMint: 'alsdjflkasjdf',
  nftImageLink:
    'https://bf3shfdg4einqbytuuofqvpjo2k3iawhuqeg4nud3i5wdrlram.arweave.net/CXcjlGbhENg_HE6UcWFXpdpW0AsekCG42g9o7YcVxA8?ext=jpeg'
};
