import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CandyShop, SingleTokenInfo, fetchNftsFromWallet } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Order, WhitelistNft, ListBase } from 'solana-candy-shop-schema/dist';
import { LOADING_SKELETON_COUNT } from 'constant/Orders';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';
import { Skeleton } from 'components/Skeleton';
import { AuctionForm } from 'components/AuctionForm';
import { AuctionNft } from 'components/AuctionNft';
import { IconTick } from 'assets/IconTick';
import { LoadStatus } from 'constant';
import dayjs from 'dayjs';

import { web3 } from '@project-serum/anchor';
import './style.less';

interface AuctionProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
}

enum StageEnum {
  SELECT = 'SELECT',
  FORM = 'FORM',
  CONFIRM = 'CONFIRM'
}

export const Auction: React.FC<AuctionProps> = ({ candyShop, wallet, walletConnectComponent }) => {
  const [selected, setSelected] = useState<any>();
  const [stage, setStage] = useState<StageEnum>(StageEnum.SELECT);
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [ownedNfts, setOwnedNfts] = useState<{ [key: string]: Order }>({});
  const [loadingNft, setLoadingNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [loadingOwnedNft, setLoadingOwnedNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const allNFTs = useRef<SingleTokenInfo[]>([]);

  const getShopIdentifiers = useCallback(async (): Promise<string[]> => {
    return candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
      );
  }, [candyShop]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    console.log('getUserNFTBatchResult: amount of valid batch NFTs=', batchNFTs.length);
    const userNFTs = allNFTs.current.concat(batchNFTs);
    allNFTs.current = userNFTs;
    setNfts(userNFTs);
  }, []);

  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: web3.PublicKey) => {
      const identifiers = await getShopIdentifiers();
      // Setup the batchCallback to retrieve the batch result.
      const fetchBatchParam: any = {
        batchCallback: getUserNFTFromBatch,
        batchSize: 8
      };
      return fetchNftsFromWallet(candyShop.connection(), walletPublicKey, identifiers, fetchBatchParam);
    },
    [candyShop, getShopIdentifiers, getUserNFTFromBatch]
  );

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!wallet?.publicKey) return;

    setLoadingNft(LoadStatus.Loading);
    progressiveLoadUserNFTs(wallet.publicKey)
      .then((allUserNFTs: SingleTokenInfo[]) => {
        console.log(`getUserNFTs success, total amount of user NFTs= ${allUserNFTs.length}`);
      })
      .catch((error: any) => {
        console.log('getUserNFTs failed, error=', error);
      })
      .finally(() => {
        setLoadingNft(LoadStatus.Loaded);
      });
  }, [progressiveLoadUserNFTs, wallet?.publicKey]);

  useEffect(() => {
    if (!wallet?.publicKey) return;
    setLoadingOwnedNft(LoadStatus.Loading);
    candyShop
      .activeOrdersByWalletAddress(wallet.publicKey.toString())
      .then((sellOrders: Order[]) => {
        setOwnedNfts(
          sellOrders.reduce((acc: any, nft: Order) => {
            acc[nft.tokenMint] = nft;
            return acc;
          }, {})
        );
      })
      .finally(() => {
        setLoadingOwnedNft(LoadStatus.Loaded);
      });
  }, [candyShop, wallet?.publicKey]);

  const onClickCard = (item: any) => () => setSelected(item);

  const checkDisableBtn = () => {
    if (stage === StageEnum.SELECT) {
      return !selected;
    }

    if (stage === StageEnum.FORM) {
      return false;
    }

    return false;
  };

  const onCreateAuction = () => {
    //
  };

  const onNext = () => {
    if (stage === StageEnum.SELECT) return setStage(StageEnum.FORM);
    if (stage === StageEnum.FORM) {
      return setStage(StageEnum.CONFIRM);
    }

    setStage(StageEnum.SELECT);
  };

  const list = nfts.filter((nft) => !ownedNfts[nft.tokenMintAddress]);
  const loading = loadingNft !== LoadStatus.Loaded || loadingOwnedNft !== LoadStatus.Loaded;

  const AuctionRightContent = (
    <>
      {stage === StageEnum.SELECT ? (
        <>
          <div className="candy-auction-description">Select the NFT you want to put up for auction!</div>

          {loading ? (
            LoadingView
          ) : list.length ? (
            <div className="candy-auction-list candy-container-list">
              {list.map((nft) => (
                <Card
                  name={nft.metadata?.data.name}
                  imgUrl={nft.nftImage}
                  ticker={nft.metadata?.data.symbol}
                  key={nft.tokenMintAddress}
                  onClick={onClickCard(nft)}
                  label={selected === nft && SelectedLabel}
                />
              ))}
            </div>
          ) : (
            <Empty description="No orders found" />
          )}

          <button disabled={checkDisableBtn()} className="candy-button candy-auction-button" onClick={onNext}>
            Next
          </button>
        </>
      ) : stage === StageEnum.FORM ? (
        <AuctionForm onSubmit={() => setStage(StageEnum.CONFIRM)} />
      ) : (
        <div className="candy-auction-confirm-container">
          <div className="candy-auction-confirm-title">
            Review and confirm the auction details are correct. Once an auction starts, you the owner will have to sell
            to the highest bidder.
          </div>
          <AuctionNft name="NFT_name" collection=" collection" imgUrl={IMAGE} />

          <div className="candy-auction-confirm-break" />
          {MOCK_CONFIRM.map(({ name, value }: any) => (
            <div className="candy-auction-confirm">
              <span>{name}</span>
              <div>{value}</div>
            </div>
          ))}

          <button
            disabled={checkDisableBtn()}
            className="candy-button candy-auction-confirm-button"
            onClick={onCreateAuction}
          >
            Create Auction
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="candy-auction">
      <div className="candy-title">Creat Auction</div>

      <div className="candy-auction-content">
        <div className="candy-auction-content-step">
          <div className="candy-auction-step-connector" />
          <div className={`candy-auction-step ${stage === StageEnum.SELECT ? 'candy-auction-step-active' : ''}`}>
            <span>1</span>
            Select an NFT
          </div>

          <div className={`candy-auction-step ${stage === StageEnum.FORM ? 'candy-auction-step-active' : ''}`}>
            <span>2</span>
            Auction Details
          </div>

          <div className={`candy-auction-step ${stage === StageEnum.CONFIRM ? 'candy-auction-step-active' : ''}`}>
            <span>3</span>
            Confirmation
          </div>
        </div>
        <div className="candy-auction-content-detail">{!wallet ? walletConnectComponent : AuctionRightContent}</div>
      </div>
    </div>
  );
};

const SelectedLabel = (
  <span className="candy-auction-tick-label">
    <IconTick fill="#7522f5" />
  </span>
);

const LoadingView = (
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

const IMAGE =
  'https://lhotgeeogrlhabitqqgfjmtxhtt2v3caww7nk2gq47gvugkky2sa.arweave.net/Wd0zEI40VnAFE4QMVLJ3POeq7EC1vtVo0OfNWhlKxqQ?ext=png';

const MOCK_CONFIRM = [
  { name: 'Starting bid', value: '15 SOL' },
  { name: 'Fees', value: '0.15 Sol (1.5%)' },
  { name: 'Bidding Period', value: '6 hours' },
  { name: 'Buy Now Price', value: '65 Sol (or n.a.)' },
  { name: 'Auction Start Date', value: dayjs().format() }
];
