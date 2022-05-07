import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import {
  CandyShop,
  SingleTokenInfo,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  FetchNFTBatchParam,
  CacheNFTParam
} from '@liqnft/candy-shop-sdk';
import { Order, WhitelistNft, ListBase, SingleBase, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';

import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionForm, FormType, CreateAuctionConfirm } from 'components/Auction';
import { IconTick } from 'assets/IconTick';

import { LoadStatus } from 'constant';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './create-auction-style.less';

interface CreateAuctionProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  onCreatedAuctionSuccess?: (auctionedToken: SingleTokenInfo) => void;
  cacheUserNFT?: boolean;
}

enum AuctionStage {
  SELECT = 'SELECT',
  FORM = 'FORM',
  CONFIRMING = 'CONFIRMING'
}
const Logger = 'CandyShopUI/CreateAuction';

const STEPS = [
  { title: 'Select an NFT', stage: AuctionStage.SELECT },
  { title: 'Auction Details', stage: AuctionStage.FORM },
  { title: 'Confirmation', stage: AuctionStage.CONFIRMING }
];

export const CreateAuction: React.FC<CreateAuctionProps> = ({
  candyShop,
  wallet,
  walletConnectComponent,
  onCreatedAuctionSuccess,
  cacheUserNFT
}) => {
  const [selected, setSelected] = useState<SingleTokenInfo>();
  const [stage, setStage] = useState<AuctionStage>(AuctionStage.SELECT);
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [listedUserNfts, setListedUserNfts] = useState<{ [key: string]: Order }>({});
  const [loadingNft, setLoadingNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [loadingListedUserNft, setLoadingListedUserNft] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [auctionForm, setAuctionForm] = useState<FormType>();
  const [shop, setShop] = useState<CandyShopResponse>();
  const [loadingShop, setLoadingShop] = useState<LoadStatus>(LoadStatus.Loading);
  const allNFTs = useRef<SingleTokenInfo[]>([]);
  const firstBatchNFTLoaded = useRef<boolean>(false);

  const isShopCreator = useCallback(
    (walletAddress: string) => {
      return walletAddress === candyShop.candyShopCreatorAddress.toString();
    },
    [candyShop]
  );

  const getShopIdentifiers = useCallback(async (): Promise<string[]> => {
    return candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
      );
  }, [candyShop]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    if (!firstBatchNFTLoaded.current) {
      firstBatchNFTLoaded.current = true;
    }
    const userNFTs = allNFTs.current.concat(batchNFTs);
    allNFTs.current = userNFTs;
    setNfts(userNFTs);
  }, []);

  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: web3.PublicKey) => {
      const identifiers = await getShopIdentifiers();
      // Setup the batchCallback to retrieve the batch result.
      const fetchBatchParam: FetchNFTBatchParam = {
        batchCallback: getUserNFTFromBatch,
        batchSize: 8
      };
      // Enable cache nft, store nft token in IDB and get nft token from IDB.
      // CandyShopSDK will always keep up-to-date status from chain in IDB once fetchNFT is called.
      const cacheNFTParam: CacheNFTParam = {
        enable: cacheUserNFT ?? false
      };

      return fetchNftsFromWallet(candyShop.connection(), walletPublicKey, identifiers, fetchBatchParam, cacheNFTParam);
    },
    [candyShop, getShopIdentifiers, getUserNFTFromBatch, cacheUserNFT]
  );

  const onFilledUpAuctionForm = (auctionForm: FormType) => {
    setAuctionForm(auctionForm);
    setStage(AuctionStage.CONFIRMING);
  };

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!wallet?.publicKey || !isShopCreator(wallet.publicKey.toString())) return;

    if (loadingNft === LoadStatus.ToLoad) {
      allNFTs.current = [];
      firstBatchNFTLoaded.current = false;
      setLoadingNft(LoadStatus.Loading);
      progressiveLoadUserNFTs(wallet.publicKey)
        .then((allUserNFTs: SingleTokenInfo[]) => {
          console.log(`${Logger}: getUserNFTs success, total amount of user NFTs= ${allUserNFTs.length}`);
        })
        .catch((error: any) => {
          console.log(`${Logger}: getUserNFTs failed, error=`, error);
          firstBatchNFTLoaded.current = true;
        })
        .finally(() => {
          setLoadingNft(LoadStatus.Loaded);
        });
    }
  }, [candyShop, progressiveLoadUserNFTs, wallet?.publicKey, isShopCreator, loadingNft]);

  useEffect(() => {
    if (!wallet?.publicKey || !isShopCreator(wallet.publicKey.toString())) return;
    if (loadingListedUserNft === LoadStatus.ToLoad) {
      setLoadingListedUserNft(LoadStatus.Loading);
      candyShop
        .activeOrdersByWalletAddress(wallet.publicKey.toString())
        .then((sellOrders: Order[]) => {
          setListedUserNfts(
            sellOrders.reduce((acc: any, nft: Order) => {
              acc[nft.tokenMint] = nft;
              return acc;
            }, {})
          );
        })
        .finally(() => {
          setLoadingListedUserNft(LoadStatus.Loaded);
        });
    }
  }, [candyShop, wallet?.publicKey, isShopCreator, loadingListedUserNft]);

  useEffect(() => {
    if (!wallet?.publicKey || !isShopCreator(wallet.publicKey.toString())) return;

    fetchShopByShopAddress(candyShop.candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        if (!data.success) return;
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: CreateAuction failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setLoadingShop(LoadStatus.Loaded);
      });
  }, [candyShop, wallet?.publicKey, isShopCreator]);

  const onClickCard = (item: any) => () => setSelected(item);

  const loading =
    !firstBatchNFTLoaded.current || loadingListedUserNft !== LoadStatus.Loaded || loadingShop !== LoadStatus.Loaded;
  const availableAuctionNfts = nfts.filter((nft) => !listedUserNfts[nft.tokenMintAddress]);
  const fee = shop?.feeRate ? shop.feeRate / 100 : undefined;

  const AuctionTickLabel = (
    <span className="candy-auction-tick-label">
      <IconTick fill="#7522f5" />
    </span>
  );
  const CreateAuctionSelectStage = (
    <>
      <div className="candy-auction-description">Select the NFT you want to put up for auction</div>
      {loading && <LoadingSkeleton />}
      {!loading && availableAuctionNfts.length > 0 && (
        <>
          <div className="candy-auction-list candy-container-list">
            {availableAuctionNfts.map((nft) => (
              <Card
                name={nft.metadata?.data.name}
                imgUrl={nft.nftImage}
                ticker={nft.metadata?.data.symbol}
                key={nft.tokenMintAddress}
                onClick={onClickCard(nft)}
                label={selected === nft ? AuctionTickLabel : undefined}
              />
            ))}
          </div>
          <button disabled={!selected} className="candy-button" onClick={() => setStage(AuctionStage.FORM)}>
            Continue
          </button>
        </>
      )}
      {loadingNft === LoadStatus.Loaded && availableAuctionNfts.length === 0 && <Empty description="No orders found" />}
    </>
  );

  const CreateAuctionStages = (
    <div className="candy-container">
      {stage === AuctionStage.SELECT && CreateAuctionSelectStage}
      {stage === AuctionStage.FORM && selected ? (
        <AuctionForm
          currencySymbol={candyShop.currencySymbol}
          fee={fee}
          nft={selected}
          auctionForm={auctionForm}
          onBack={() => {
            setStage(AuctionStage.SELECT);
            setAuctionForm(undefined);
          }}
          onSubmit={(form: FormType) => onFilledUpAuctionForm(form)}
        />
      ) : null}
      {stage === AuctionStage.CONFIRMING && selected && auctionForm && (
        <CreateAuctionConfirm
          candyShop={candyShop}
          wallet={wallet}
          selected={selected}
          onBack={() => setStage(AuctionStage.FORM)}
          auctionForm={auctionForm}
          onCreateAuctionSuccess={(token: SingleTokenInfo) => onCreatedAuctionSuccess && onCreatedAuctionSuccess(token)}
          fee={fee}
        />
      )}
    </div>
  );

  const NotOwnerNotification = (
    <div className="candy-auction-description">You must be the shop owner to create auctions.</div>
  );

  return (
    <div className="candy-auction">
      <div className="candy-title">Create Auction</div>
      <div className="candy-auction-content">
        <div className="candy-auction-content-step">
          <div className="candy-auction-step-connector" />
          {STEPS.map((step, idx) => (
            <div key={idx} className={`candy-auction-step ${stage === step.stage ? 'candy-auction-step-active' : ''}`}>
              <span>{idx + 1}</span>
              {step.title}
            </div>
          ))}
        </div>
        <div className="candy-auction-content-detail">
          {wallet && (isShopCreator(wallet.publicKey.toString()) ? CreateAuctionStages : NotOwnerNotification)}
          {!wallet && walletConnectComponent}
        </div>
      </div>
    </div>
  );
};
