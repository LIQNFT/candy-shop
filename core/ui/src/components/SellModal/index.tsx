import React, { useCallback, useEffect, useState } from 'react';
import { NftMetadata, SingleTokenInfo, ExplorerLinkBase } from '@liqnft/candy-shop-sdk';
import { Blockchain, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';

import { LiqImage } from 'components/LiqImage';
import { Modal } from 'components/Modal';
import { NftStat } from 'components/NftStat';
import { Processing } from 'components/Processing';
import { Tooltip } from 'components/Tooltip';

import { Wallet, TransactionState } from 'model';
import { ErrorMsgMap, ErrorType, handleError } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';

import IconTick from 'assets/IconTick';
import './style.less';

export type SellModalProps = {
  nft: SingleTokenInfo;
  wallet: Wallet;
  shopResponse: CandyShopResponse;
  currencySymbol: string;
  currencyDecimals: number;
  candyShopEnv: Blockchain;
  explorerLink: ExplorerLinkBase;
  onCancel: () => void;
  getTokenMetadataByMintAddress: (tokenMintAddress: string) => Promise<NftMetadata>;
  sell: (nft: SingleTokenInfo, price: number) => Promise<string>;
};

const getLocalNumber = (price: string) => {
  const arr = price.split('.');

  if (price.includes('.') && arr[1] === '') {
    return `${arr[0].replace(/\d(?=(?:\d{3})+$)/g, '$&,')}.`;
  }
  return arr[0].replace(/\d(?=(?:\d{3})+$)/g, '$&,') + (arr[1] ? `.${arr[1]}` : '');
};

export const SellModal: React.FC<SellModalProps> = ({
  onCancel: onUnSelectItem,
  nft,
  wallet,
  shopResponse,
  currencySymbol,
  currencyDecimals,
  candyShopEnv,
  explorerLink,
  getTokenMetadataByMintAddress,
  sell
}) => {
  const [formState, setFormState] = useState<{ price: string | undefined }>({
    price: undefined
  });
  const [state, setState] = useState(TransactionState.DISPLAY);
  const [loading, setLoading] = useState<boolean>(true);
  const [royalties, setRoyalties] = useState<number>();

  const sellNft = async () => {
    setState(TransactionState.PROCESSING);

    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    if (!formState.price) {
      notification('Please input sell price', NotificationType.Error);
      setState(TransactionState.DISPLAY);
      return;
    } else if (+formState.price < Math.pow(10, -currencyDecimals + 2)) {
      notification(
        'The input sell price must greater than or equal to ' + Math.pow(10, -currencyDecimals + 2),
        NotificationType.Error
      );
      setState(TransactionState.DISPLAY);
      return;
    }

    return sell(nft, +formState.price)
      .then((txHash: string) => {
        console.log('SellModal: Place sell order with transaction hash= ', txHash);
        setState(TransactionState.CONFIRMED);
      })
      .catch((err: Error) => {
        console.log('SellModal: error= ', err);
        handleError(err, 'Sell nft failed');
        setState(TransactionState.DISPLAY);
      });
  };

  // Check active button submit
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let price = e.target.value.replace(/,/gi, '');
    if (!Number(price)) return;
    if (price === '') {
      setFormState((f) => ({ ...f, price: undefined }));
      return;
    }

    const arr = price.split('.');
    if (arr[0].length > 11) return;
    if ((arr[1] || '').length > 3) {
      price = `${arr[0]}.${arr[1].slice(0, 3)}`;
    }

    setFormState((f) => ({ ...f, price }));
  };

  const onCancel = useCallback(() => {
    onUnSelectItem();
  }, [onUnSelectItem]);

  useEffect(() => {
    setLoading(true);
    getTokenMetadataByMintAddress(nft.tokenMintAddress)
      .then((data: NftMetadata) => {
        setRoyalties(data.sellerFeeBasisPoints / 100);
      })
      .catch((err: Error) => {
        console.log('ERROR getTokenMetadataByMintAddress', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [getTokenMetadataByMintAddress, nft.tokenMintAddress]);

  const onCloseModal = () => {
    onCancel();
  };

  const disableListedBtn = formState.price === undefined || loading;
  const transactionFee = shopResponse ? shopResponse.feeRate / 100 : 0;
  const isEth = candyShopEnv !== Blockchain.SolDevnet && candyShopEnv !== Blockchain.SolMainnetBeta;

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
                <NftStat
                  tokenMint={nft.tokenMintAddress}
                  edition={nft.edition}
                  candyShopEnv={candyShopEnv}
                  explorerLink={explorerLink}
                />
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <form>
              <div className="candy-sell-modal-input-number">
                <input
                  placeholder="Price"
                  onChange={onChangeInput}
                  value={formState.price === undefined ? '' : getLocalNumber(formState.price)}
                  type="text"
                />
                <span>{currencySymbol}</span>
              </div>

              <div className="candy-sell-modal-fees">
                <div className="candy-sell-modal-fees-left">
                  Transaction Fees
                  {isEth ? null : (
                    <>
                      <br />
                      Royalties
                    </>
                  )}
                </div>
                {loading ? (
                  <div className="candy-loading candy-sell-modal-loading" />
                ) : (
                  <div className="candy-sell-modal-fees-right">
                    <Tooltip inner="Payable to marketplace" className="candy-tooltip-right">
                      {transactionFee !== undefined && !isNaN(transactionFee) ? transactionFee.toFixed(1) + '%' : 'n/a'}
                    </Tooltip>
                    {isEth ? null : (
                      <Tooltip inner="Payable to NFT creators" className="candy-tooltip-right">
                        {royalties !== undefined && !isNaN(royalties) ? royalties.toFixed(1) + '%' : 'n/a'}
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>

              <button className="candy-sell-modal-button candy-button" onClick={sellNft} disabled={disableListedBtn}>
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
