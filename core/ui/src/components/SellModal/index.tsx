import React, { useCallback, useState, useEffect, useContext } from 'react';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  CandyShop,
  SingleTokenInfo,
  getTokenMetadataByMintAddress,
  NftMetadata
} from '@liqnft/candy-shop-sdk';

import Modal from 'components/Modal';
import Processing from 'components/Processing';
import { LiqImage } from 'components/LiqImage';
import { NftStat } from 'components/NftStat';
import { Tooltip } from 'components/Tooltip';

import IconTick from 'assets/IconTick';
import { handleError, ErrorType, ErrorMsgMap } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { TransactionState } from 'model';
import { CandyShop as CandyShopResponse } from 'solana-candy-shop-schema/dist';
import { TIMEOUT_REFETCH_NFT } from 'constant';
import { CandyActionContext } from 'public/Context';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import './style.less';

export interface SellModalProps {
  onCancel: () => void;
  nft: SingleTokenInfo;
  candyShop: CandyShop;
  wallet: AnchorWallet;
  shop: CandyShopResponse;
}

export const SellModal: React.FC<SellModalProps> = ({
  onCancel: onUnSelectItem,
  nft,
  candyShop,
  wallet,
  shop
}) => {
  const [formState, setFormState] = useState<{ price: number | undefined }>({
    price: undefined
  });
  const [state, setState] = useState(TransactionState.DISPLAY);
  const { setRefetch } = useContext(CandyActionContext);

  const timeoutRef = useUnmountTimeout();

  const [loading, setLoading] = useState<boolean>(true);
  const [royalties, setRoyalties] = useState<number>();

  // List for sale and move to next step
  const sell = async () => {
    setState(TransactionState.PROCESSING);

    if (!wallet) {
      notification(
        ErrorMsgMap[ErrorType.InvalidWallet],
        NotificationType.Error
      );
      return;
    }

    if (!formState.price) {
      notification('Please input sell price', NotificationType.Error);
      setState(TransactionState.DISPLAY);
      return;
    }

    const price = formState.price * candyShop.baseUnitsPerCurrency;

    console.log(candyShop);
    return candyShop
      .sell(
        new web3.PublicKey(nft.tokenAccountAddress),
        new web3.PublicKey(nft.tokenMintAddress),
        new BN(price),
        wallet
      )
      .then((txHash) => {
        console.log(
          'SellModal: Place sell order with transaction hash= ',
          txHash
        );
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_REFETCH_NFT);
      })
      .catch((err) => {
        console.log('SellModal: error= ', err);
        handleError({ error: err });
        setState(TransactionState.DISPLAY);
      });
  };

  // Check active button submit
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setFormState((f) => ({ ...f, price: undefined }));
      return;
    }

    const regex3Decimals = new RegExp('^[0-9]{1,11}(?:.[0-9]{1,3})?$');
    if (regex3Decimals.test(e.target.value)) {
      setFormState((f) => ({ ...f, price: +e.target.value }));
    }
  };

  const onCancel = useCallback(() => {
    onUnSelectItem();
    if (state === TransactionState.CONFIRMED)
      setTimeout(() => window.location.reload(), 3_000);
  }, [state, onUnSelectItem]);

  useEffect(() => {
    //prettier-ignore
    console.log('getTokenMetadataByMintAddress', { mint: nft.tokenMintAddress });
    setLoading(true);
    getTokenMetadataByMintAddress(nft.tokenMintAddress, candyShop.connection())
      .then((data: NftMetadata) => {
        setRoyalties(data.sellerFeeBasisPoints / 100);
      })
      .catch((err) => {
        console.log('ERROR getTokenMetadataByMintAddress', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [nft.tokenMintAddress, candyShop]);

  const onCloseModal = () => {
    onCancel();
    if (state === TransactionState.CONFIRMED) {
      setRefetch();
    }
  };

  const disableListedBtn = formState.price === undefined || loading;
  const transactionFee = shop.feeRate / 100;

  return (
    <Modal onCancel={onCloseModal} width={600}>
      <div className="candy-sell-modal">
        {state === TransactionState.DISPLAY && (
          <div>
            <div className="candy-sell-modal-title">Sell</div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage
                  src={nft?.nftImage}
                  alt={nft?.metadata?.data?.name}
                  fit="contain"
                />
              </div>
              <div>
                <div className="candy-sell-modal-nft-name">
                  {nft?.metadata?.data?.name}
                </div>
                <div className="candy-sell-modal-symbol">
                  {nft?.metadata?.data?.symbol}
                </div>
                <NftStat
                  tokenMint={nft.tokenMintAddress}
                  edition={nft.edition}
                />
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <form>
              <div className="candy-sell-modal-input-number">
                <input
                  placeholder="Price"
                  min={0}
                  onChange={onChangeInput}
                  type="number"
                  value={formState.price === undefined ? '' : formState.price}
                />
                <span>{candyShop.currencySymbol}</span>
              </div>

              <div className="candy-sell-modal-fees">
                <div className="candy-sell-modal-fees-left">
                  Transaction Fees
                  <br />
                  Royalties
                </div>
                {loading ? (
                  <div className="candy-loading candy-sell-modal-loading" />
                ) : (
                  <div className="candy-sell-modal-fees-right">
                    <Tooltip
                      inner="Payable to marketplace"
                      className="candy-tooltip-right"
                    >
                      {transactionFee !== undefined && !isNaN(transactionFee)
                        ? transactionFee.toFixed(1) + '%'
                        : 'n/a'}
                    </Tooltip>
                    <Tooltip
                      inner="Payable to NFT creators"
                      className="candy-tooltip-right"
                    >
                      {royalties !== undefined && !isNaN(royalties)
                        ? royalties.toFixed(1) + '%'
                        : 'n/a'}
                    </Tooltip>
                  </div>
                )}
              </div>

              <button
                className="candy-sell-modal-button candy-button"
                onClick={sell}
                disabled={disableListedBtn}
              >
                List for Sale
              </button>
            </form>
          </div>
        )}
        {state === TransactionState.PROCESSING && (
          <Processing text="Listing your NFT" />
        )}
        {state === TransactionState.CONFIRMED && (
          <>
            <div className="candy-sell-modal-title">
              <IconTick />
            </div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage src={nft?.nftImage} alt="NFT image" fit="contain" />
              </div>
              <div className="candy-sell-modal-listed">
                <span style={{ fontWeight: 'bold' }}>
                  {nft?.metadata?.data?.name}
                </span>{' '}
                is now listed for sale
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <button
              className="candy-sell-modal-button candy-button"
              onClick={() => {
                onCancel();
                setRefetch();
              }}
            >
              Continue Browsing
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
