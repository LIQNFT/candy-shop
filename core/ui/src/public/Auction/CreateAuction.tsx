import React, { useState, useCallback, useMemo } from 'react';
import { BN, web3 } from '@project-serum/anchor';
import { SingleTokenInfo, CandyShopVersion } from '@liqnft/candy-shop-sdk';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { AuctionForm, FormType, CreateAuctionConfirm } from 'components/Auction';
import { IconTick } from 'assets/IconTick';
import { LoadStatus } from 'constant';
import { ShopProps } from '../../model';
import dayjs from 'dayjs';

import './create-auction-style.less';

import { notification, NotificationType } from 'utils/rc-notification';
import { convertTime12to24 } from 'utils/timer';
import useUserNfts from 'hooks/useUserNfts';
import { SolStore, StoreProvider } from 'market';
import { handleError } from 'utils/ErrorHandler';

interface CreateAuctionProps extends ShopProps {
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
  walletConnectComponent,
  onCreatedAuctionSuccess,
  cacheUserNFT,
  candyShop,
  wallet
}) => {
  const {
    loading: loadingSeller,
    nfts,
    sellOrders,
    shopResponse: shop
  } = useUserNfts({ candyShop, wallet }, { enableCacheNFT: cacheUserNFT, allowSellAnyNFTs: true });
  const store = useMemo(() => StoreProvider({ candyShop, wallet }), [candyShop, wallet]);

  const [selected, setSelected] = useState<SingleTokenInfo>();
  const [stage, setStage] = useState<AuctionStage>(AuctionStage.SELECT);

  const [auctionForm, setAuctionForm] = useState<FormType>();

  const publicKey = wallet?.publicKey?.toString();

  const isShopCreator = useCallback(
    (walletAddress: string) => {
      return walletAddress === candyShop.candyShopCreatorAddress.toString();
    },
    [candyShop.candyShopCreatorAddress]
  );

  const onFilledUpAuctionForm = (auctionForm: FormType) => {
    setAuctionForm(auctionForm);
    setStage(AuctionStage.CONFIRMING);
  };

  const onClickCard = (item: any) => () => setSelected(item);

  const onGoToNextAuctionDetail = () => {
    setStage(AuctionStage.FORM);
    window.scrollTo({ top: document.getElementById('candy-auction-title-id')?.offsetTop, behavior: 'smooth' });
  };

  const loading = loadingSeller !== LoadStatus.Loaded;
  const availableAuctionNfts = nfts.filter((nft) => !sellOrders[nft.tokenMintAddress]);
  const fee = shop?.feeRate ? shop.feeRate / 100 : undefined;

  const AuctionTickLabel = (
    <span className="candy-auction-tick-label">
      <IconTick fill="#7522f5" />
    </span>
  );

  const onCreateAuction = () => {
    if (!wallet || !auctionForm || !selected) return;

    if (!(store instanceof SolStore)) {
      console.warn(`${Logger}: Invalid request, Only Solana supports CreateAuction`);
      return;
    }

    const startingBid = new BN(Number(auctionForm.startingBid) * 10 ** candyShop.currencyDecimals);
    const startTime = new BN(
      //prettier-ignore
      dayjs(auctionForm.startNow ? undefined : `${auctionForm.startDate} ${convertTime12to24(auctionForm.auctionHour, auctionForm.auctionMinute, auctionForm.clockFormat)}`).unix()
    );
    // measured in hours
    const biddingPeriod = new BN(Number(auctionForm.biddingPeriod) * 3600);
    const buyNowPrice = auctionForm.buyNow
      ? new BN(Number(auctionForm.buyNowPrice) * 10 ** candyShop.currencyDecimals)
      : null;
    const tickSize = new BN(Number(auctionForm.tickSize) * 10 ** candyShop.currencyDecimals);

    let params: any = {
      startingBid,
      startTime,
      biddingPeriod,
      buyNowPrice,
      tokenAccount: new web3.PublicKey(selected.tokenAccountAddress),
      tokenMint: new web3.PublicKey(selected.tokenMintAddress),
      wallet,
      tickSize
    };

    if (showExtensionBidding && !auctionForm.disableBiddingExtension) {
      params = {
        ...params,
        extensionPeriod: new BN(Number(auctionForm.extensionPeriod)),
        extensionIncrement: new BN(Number(auctionForm.extensionPeriod))
      };
    }

    store
      .createAuction(params)
      .then(() => {
        notification('Auction created', NotificationType.Success);

        onCreatedAuctionSuccess && onCreatedAuctionSuccess(selected);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: Create Auction failed=`, err);
        handleError(err);
      });
  };

  const showExtensionBidding = candyShop.version === CandyShopVersion.V2;

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
      {!loading && availableAuctionNfts.length === 0 && <Empty description="No orders found" />}
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
          showExtensionBidding={showExtensionBidding}
        />
      ) : null}
      {stage === AuctionStage.CONFIRMING && selected && auctionForm && (
        <CreateAuctionConfirm
          selected={selected}
          onBack={() => setStage(AuctionStage.FORM)}
          auctionForm={auctionForm}
          fee={fee}
          showExtensionBidding={showExtensionBidding}
          onCreateAuction={onCreateAuction}
          currencySymbol={candyShop.currencySymbol}
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
