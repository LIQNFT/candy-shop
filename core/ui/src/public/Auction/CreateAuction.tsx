import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import {
  CandyShop,
  SingleTokenInfo,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  FetchNFTBatchParam,
  CacheNFTParam,
  Blockchain,
  EthCandyShop
} from '@liqnft/candy-shop-sdk';
import { Order, SingleBase, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionForm, FormType, CreateAuctionConfirm } from 'components/Auction';
import { IconTick } from 'assets/IconTick';
import { LoadStatus } from 'constant';
import { CommonChain, EthWallet } from '../../model';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './create-auction-style.less';

interface CreateAuctionType<C, S, W> extends CommonChain<C, S, W> {
  walletConnectComponent: React.ReactElement;
  onCreatedAuctionSuccess?: (auctionedToken: SingleTokenInfo) => void;
  cacheUserNFT?: boolean;
}

type CreateAuctionProps =
  | CreateAuctionType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | CreateAuctionType<Blockchain.Solana, CandyShop, AnchorWallet>;

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
  walletConnectComponent,
  onCreatedAuctionSuccess,
  cacheUserNFT,
  ...chainProps
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

  const publicKey = chainProps.wallet?.publicKey.toString();

  const isShopCreator = useCallback(
    (walletAddress: string) => {
      return walletAddress === chainProps.candyShop.candyShopCreatorAddress.toString();
    },
    [chainProps.candyShop.candyShopCreatorAddress]
  );

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

      switch (chainProps.blockchain) {
        case Blockchain.Solana:
          return fetchNftsFromWallet(
            chainProps.candyShop.connection(),
            walletPublicKey,
            undefined,
            fetchBatchParam,
            cacheNFTParam
          );
        default:
          return console.log('DEFINE FUNCTION FOR ETH');
      }
    },
    [getUserNFTFromBatch, cacheUserNFT, chainProps.blockchain, chainProps.candyShop]
  );

  const onFilledUpAuctionForm = (auctionForm: FormType) => {
    setAuctionForm(auctionForm);
    setStage(AuctionStage.CONFIRMING);
  };

  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!publicKey || !isShopCreator(publicKey) || chainProps.blockchain !== Blockchain.Solana) return;

    if (loadingNft === LoadStatus.ToLoad) {
      allNFTs.current = [];
      firstBatchNFTLoaded.current = false;
      setLoadingNft(LoadStatus.Loading);
      progressiveLoadUserNFTs(new web3.PublicKey(publicKey))
        .then((allUserNFTs: SingleTokenInfo[] | void) => {
          console.log(`${Logger}: getUserNFTs success, total amount of user NFTs= ${allUserNFTs?.length || 0}`);
        })
        .catch((error: any) => {
          console.log(`${Logger}: getUserNFTs failed, error=`, error);
          firstBatchNFTLoaded.current = true;
        })
        .finally(() => {
          setLoadingNft(LoadStatus.Loaded);
        });
    }
  }, [progressiveLoadUserNFTs, isShopCreator, loadingNft, chainProps.blockchain, publicKey]);

  useEffect(() => {
    if (!publicKey || !isShopCreator(publicKey)) return;
    if (loadingListedUserNft === LoadStatus.ToLoad) {
      setLoadingListedUserNft(LoadStatus.Loading);

      const getActiveOrdersFollowChain = (): Promise<Order[]> => {
        switch (chainProps.blockchain) {
          case Blockchain.Solana: {
            if (!publicKey) return new Promise((resolve) => resolve([]));
            return chainProps.candyShop.activeOrdersByWalletAddress(publicKey);
          }
          default:
            return new Promise((resolve) => resolve([]));
        }
      };

      getActiveOrdersFollowChain()
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
  }, [chainProps.blockchain, chainProps.candyShop, isShopCreator, loadingListedUserNft, publicKey]);

  useEffect(() => {
    if (!publicKey || !isShopCreator(publicKey)) return;

    fetchShopByShopAddress(chainProps.candyShop.candyShopAddress)
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
  }, [chainProps.candyShop.candyShopAddress, isShopCreator, publicKey]);

  const onClickCard = (item: any) => () => setSelected(item);

  const onGoToNextAuctionDetail = () => {
    setStage(AuctionStage.FORM);
    window.scrollTo({ top: document.getElementById('candy-auction-title-id')?.offsetTop, behavior: 'smooth' });
  };

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
          <button
            disabled={!selected}
            className="candy-button candy-auction-select-button"
            onClick={onGoToNextAuctionDetail}
          >
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
          currencySymbol={chainProps.candyShop.currencySymbol}
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
          {...chainProps}
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
      <div className="candy-title" id="candy-auction-title-id">
        Create Auction
      </div>
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
          {publicKey && (isShopCreator(publicKey) ? CreateAuctionStages : NotOwnerNotification)}
          {!publicKey && walletConnectComponent}
        </div>
      </div>
    </div>
  );
};
