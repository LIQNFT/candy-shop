import React, { useCallback, useEffect, useState } from 'react';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import {
  Blockchain,
  CandyShop,
  CandyShopTrade,
  CandyShopTradeSellParams,
  EthCandyShop,
  getTokenMetadataByMintAddress,
  NftMetadata,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';
import { CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import { LiqImage } from 'components/LiqImage';
import { Modal } from 'components/Modal';
import { NftStat } from 'components/NftStat';
import { Processing } from 'components/Processing';
import { Tooltip } from 'components/Tooltip';

import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import { CommonChain, EthWallet, TransactionState } from 'model';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { TIMEOUT_EXTRA_LOADING } from 'constant';
import IconTick from 'assets/IconTick';
import './style.less';

export interface SellModalType<C, S, W> extends CommonChain<C, S, W> {
  onCancel: () => void;
  nft: SingleTokenInfo;
  shop: CandyShopResponse;
  shopAddress: string;
  candyShopProgramId?: string;
  baseUnitsPerCurrency: number;
  shopTreasuryMint: string;
  shopCreatorAddress: string;
  currencySymbol: string;
}
type SellModalProps =
  | SellModalType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | SellModalType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const SellModal: React.FC<SellModalProps> = ({
  onCancel: onUnSelectItem,
  nft,
  shop,
  shopAddress,
  candyShopProgramId,
  baseUnitsPerCurrency,
  shopTreasuryMint,
  shopCreatorAddress,
  currencySymbol,
  ...chainProps
}) => {
  const [formState, setFormState] = useState<{ price: number | undefined }>({
    price: undefined
  });
  const [state, setState] = useState(TransactionState.DISPLAY);
  const [loading, setLoading] = useState<boolean>(true);
  const [royalties, setRoyalties] = useState<number>();

  const timeoutRef = useUnmountTimeout();

  const sell = async () => {
    setState(TransactionState.PROCESSING);

    if (!chainProps?.wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }

    if (!formState.price) {
      notification('Please input sell price', NotificationType.Error);
      setState(TransactionState.DISPLAY);
      return;
    }

    const price = formState.price * baseUnitsPerCurrency;

    const getAction = (): any => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana: {
          if (!chainProps.wallet || !candyShopProgramId) return;
          const tradeSellParams: CandyShopTradeSellParams = {
            connection: chainProps.candyShop.connection(),
            tokenAccount: new web3.PublicKey(nft.tokenAccountAddress),
            tokenMint: new web3.PublicKey(nft.tokenMintAddress),
            price: new BN(price),
            wallet: chainProps.wallet,
            shopAddress: new web3.PublicKey(shopAddress),
            candyShopProgramId: new web3.PublicKey(candyShopProgramId),
            shopTreasuryMint: new web3.PublicKey(shopTreasuryMint),
            shopCreatorAddress: new web3.PublicKey(shopCreatorAddress)
          };

          return CandyShopTrade.sell(tradeSellParams);
        }
        default: {
          console.log('WIP ETH1');
        }
      }
    };

    return getAction()
      .then((txHash: string) => {
        console.log('SellModal: Place sell order with transaction hash= ', txHash);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err: Error) => {
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
  }, [onUnSelectItem]);

  useEffect(() => {
    console.log('getTokenMetadataByMintAddress', { mint: nft.tokenMintAddress });
    setLoading(true);

    const getAction = (): Promise<any> => {
      switch (chainProps.blockchain) {
        case Blockchain.Solana: {
          return getTokenMetadataByMintAddress(nft.tokenMintAddress, chainProps.candyShop.connection());
        }
        default:
          return new Promise((res) => {
            console.log('WIP ETH');
            res({ sellerFeeBasisPoints: 0 });
          });
      }
    };
    getAction()
      .then((data: NftMetadata) => {
        setRoyalties(data.sellerFeeBasisPoints / 100);
      })
      .catch((err: Error) => {
        console.log('ERROR getTokenMetadataByMintAddress', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chainProps.blockchain, chainProps.candyShop, nft.tokenMintAddress]);

  const onCloseModal = () => {
    onCancel();
  };

  const disableListedBtn = formState.price === undefined || loading;
  const transactionFee = shop ? shop.feeRate / 100 : 0;

  return (
    <Modal onCancel={onCloseModal} width={600}>
      <div className="candy-sell-modal">
        {state === TransactionState.DISPLAY && (
          <div>
            <div className="candy-sell-modal-title">Sell</div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage src={nft?.nftImage} alt={nft?.metadata?.data?.name} fit="contain" />
              </div>
              <div>
                <div className="candy-sell-modal-nft-name">{nft?.metadata?.data?.name}</div>
                <div className="candy-sell-modal-symbol">{nft?.metadata?.data?.symbol}</div>
                <NftStat tokenMint={nft.tokenMintAddress} edition={nft.edition} {...chainProps} />
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
                <span>{currencySymbol}</span>
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
                    <Tooltip inner="Payable to marketplace" className="candy-tooltip-right">
                      {transactionFee !== undefined && !isNaN(transactionFee) ? transactionFee.toFixed(1) + '%' : 'n/a'}
                    </Tooltip>
                    <Tooltip inner="Payable to NFT creators" className="candy-tooltip-right">
                      {royalties !== undefined && !isNaN(royalties) ? royalties.toFixed(1) + '%' : 'n/a'}
                    </Tooltip>
                  </div>
                )}
              </div>

              <button className="candy-sell-modal-button candy-button" onClick={sell} disabled={disableListedBtn}>
                List for Sale
              </button>
            </form>
          </div>
        )}
        {state === TransactionState.PROCESSING && <Processing text="Listing your NFT" />}
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
                <span style={{ fontWeight: 'bold' }}>{nft?.metadata?.data?.name}</span> is now listed for sale
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <button className="candy-sell-modal-button candy-button" onClick={onCancel}>
              Continue Browsing
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
