import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { CandyShop, SingleTokenInfo, fetchNftsFromWallet, fetchShopByShopAddress } from '@liqnft/candy-shop-sdk';
import { Order, WhitelistNft, ListBase, SingleBase, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';
import { Skeleton } from 'components/Skeleton';
import { AuctionForm, FormType } from 'components/AuctionForm';
import { AuctionNftHeader } from 'components/AuctionNftHeader';
import { IconTick } from 'assets/IconTick';

import { LOADING_SKELETON_COUNT } from 'constant/Orders';
import { LoadStatus } from 'constant';
import { notification, NotificationType } from 'utils/rc-notification';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './style.less';

interface CreateAuctionProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  onCreateAuctionSuccess?: () => void;
}

enum StageEnum {
  SELECT = 'SELECT',
  FORM = 'FORM',
  CONFIRM = 'CONFIRM'
}
const Logger = 'CandyShopUI/CreateAuction';

export const CreateAuction: React.FC<CreateAuctionProps> = ({
  candyShop,
  wallet,
  walletConnectComponent,
  onCreateAuctionSuccess
}) => {
  const [selected, setSelected] = useState<SingleTokenInfo>();
  const [stage, setStage] = useState<StageEnum>(StageEnum.SELECT);
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [ownedNfts, setOwnedNfts] = useState<{ [key: string]: Order }>({});
  const [loadingNft, setLoadingNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [loadingOwnedNft, setLoadingOwnedNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [auctionForm, setAuctionForm] = useState<FormType>();
  const [shop, setShop] = useState<CandyShopResponse>();
  const [loadingShop, setLoadingShop] = useState<LoadStatus>(LoadStatus.Loading);
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

  useEffect(() => {
    if (!wallet?.publicKey) return;

    fetchShopByShopAddress(candyShop.candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        if (!data.success) return;
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: Sell failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setLoadingShop(LoadStatus.Loaded);
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
    if (!wallet || !auctionForm || !selected) return;

    const startingBid = new BN(Number(auctionForm.starting_bid) * 10 ** candyShop.currencyDecimals);
    const startTime = new BN(
      dayjs(
        `${auctionForm.start_date} ${convertTime12to24(
          auctionForm.auction_hour,
          auctionForm.auction_minute,
          auctionForm.clock_format
        )} UTC`
      ).unix()
    );
    const biddingPeriod = new BN(Number(auctionForm.bidding_period) * 3600);
    const buyNowPrice = auctionForm.buy_now
      ? new BN(Number(auctionForm.buy_now_price) * 10 ** candyShop.currencyDecimals)
      : null;
    const tickSize = new BN(Number(auctionForm.tickSize) * 10 ** candyShop.currencyDecimals);

    candyShop
      .createAuction({
        startingBid,
        startTime,
        biddingPeriod,
        buyNowPrice,
        tokenAccount: new web3.PublicKey(selected.tokenAccountAddress),
        tokenMint: new web3.PublicKey(selected.tokenMintAddress),
        wallet,
        tickSize
      })
      .then(() => {
        notification('Create Auction successful.', NotificationType.Success);
        onCreateAuctionSuccess && onCreateAuctionSuccess();
      })
      .catch((err) => {
        console.log(`${Logger} fail=`, err);
      });
  };

  const onContinue = () => {
    if (stage === StageEnum.SELECT) return setStage(StageEnum.FORM);
    if (stage === StageEnum.FORM) {
      return setStage(StageEnum.CONFIRM);
    }

    setStage(StageEnum.SELECT);
  };

  const loading =
    loadingNft !== LoadStatus.Loaded || loadingOwnedNft !== LoadStatus.Loaded || loadingShop !== LoadStatus.Loaded;

  const list = nfts.filter((nft) => !ownedNfts[nft.tokenMintAddress]);
  const fee = shop?.feeRate ? shop.feeRate / 100 : undefined;

  const confirmDetails =
    stage === StageEnum.CONFIRM && auctionForm
      ? [
          { name: 'Starting bid', value: `${auctionForm.starting_bid} ${candyShop.currencySymbol}` },
          {
            name: 'Fees',
            value: fee
              ? `${((Number(auctionForm.starting_bid) * fee) / 100).toFixed(2)} ${candyShop.currencySymbol} (${fee}%)`
              : 'n/a'
          },
          { name: 'Bidding Period', value: `${auctionForm.bidding_period} hour(s)` },
          {
            name: 'Buy Now Price',
            value: auctionForm.buy_now ? `${auctionForm.buy_now_price} ${candyShop.currencySymbol}` : 'n/a'
          },
          {
            name: 'Auction Start Date',
            value: getStartTime(auctionForm)
          }
        ]
      : [];

  const CreateAuctionContent = (
    <div className="candy-container">
      {stage === StageEnum.SELECT ? (
        <>
          <div className="candy-auction-description">Select the NFT you want to put up for auction</div>

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
                  label={selected === nft ? SelectedTick : undefined}
                />
              ))}
            </div>
          ) : (
            <Empty description="No orders found" />
          )}

          <button disabled={checkDisableBtn()} className="candy-button candy-auction-button" onClick={onContinue}>
            Continue
          </button>
        </>
      ) : stage === StageEnum.FORM && selected ? (
        <AuctionForm
          onSubmit={(form) => {
            console.log({ form });
            setAuctionForm(form);
            setStage(StageEnum.CONFIRM);
          }}
          currencySymbol={candyShop.currencySymbol}
          fee={fee}
          nft={selected}
          auctionForm={auctionForm}
        />
      ) : (
        <div className="candy-auction-confirm-container">
          <div className="candy-auction-confirm-title">
            Review and confirm the auction details are correct. You can cancel the auction before it starts, but once an
            auction begins, the owner will have to sell to the highest bidder.
          </div>
          {selected ? (
            <AuctionNftHeader
              name={selected.metadata?.data.name}
              ticker={selected.metadata?.data.symbol}
              imgUrl={selected.nftImage}
              edition={selected.edition}
            />
          ) : null}

          <div className="candy-auction-confirm-break" />
          {confirmDetails.map(({ name, value }: { name: string; value: string }) => (
            <div className="candy-auction-confirm" key={name}>
              <span>{name}</span>
              <div>{value}</div>
            </div>
          ))}

          <div className="candy-auction-confirm-button-container">
            <span onClick={() => setStage(StageEnum.FORM)}>Back</span>
            <button
              disabled={checkDisableBtn()}
              className="candy-button candy-auction-confirm-button"
              onClick={onCreateAuction}
            >
              Create Auction
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="candy-auction">
      <div className="candy-title">Create Auction</div>
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
        <div className="candy-auction-content-detail">{!wallet ? walletConnectComponent : CreateAuctionContent}</div>
      </div>
    </div>
  );
};

const SelectedTick = (
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

const getStartTime = (auctionForm: FormType): string => {
  if (!auctionForm.auction_hour || !auctionForm.auction_minute || !auctionForm.clock_format) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  if (auctionForm.start_now) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  return (
    dayjs
      .utc(
        `${auctionForm.start_date} ${convertTime12to24(
          auctionForm.auction_hour,
          auctionForm.auction_minute,
          auctionForm.clock_format
        )}`,
        'YYYY-MM-DD HH:mm'
      )
      .format('MMMM DD, YYYY hh:mmA') + ' UTC'
  );
};

const convertTime12to24 = (hour: string, min: string, clock_format: string): string => {
  if (hour === '12') {
    hour = '00';
  }

  if (clock_format === 'PM') {
    hour = (parseInt(hour, 10) + 12).toString();
  }

  return `${hour}:${min}`;
};
