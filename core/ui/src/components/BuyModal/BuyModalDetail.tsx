import React, { useCallback, useEffect, useState } from 'react';
import { CandyShop, CandyShopPay, fetchNFTByMintAddress, getCandyShopSync } from '@liqnft/candy-shop-sdk';
import { Nft, Order as OrderSchema, SingleBase } from '@liqnft/candy-shop-types';
import { web3 } from '@project-serum/anchor';
import { Modal } from 'components/Modal';
import { NftAttributes } from 'components/NftAttributes';
import { NftStat } from 'components/NftStat';
import { NftVerification } from 'components/Tooltip/NftVerification';
import { Viewer } from 'components/Viewer';
import { useCandyShopPayContext } from 'contexts/CandyShopPayProvider';
import { ShopExchangeInfo } from 'model';
import { getPrice } from 'utils/getPrice';
import { StripePayment } from 'components/Payment';

const Logger = 'CandyShopUI/BuyModalDetail';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  shopProgramId: string;
  sellerUrl?: string;
  candyShop: CandyShop;
}

export const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  exchangeInfo,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl,
  candyShop,
  shopProgramId,
}) => {
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft>();

  const [creditCardPayAvailable, setCreditCardPayAvailable] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const stripePublicKey = useCandyShopPayContext()?.stripePublicKey;

  const orderShopId = getCandyShopSync(
    new web3.PublicKey(order.candyShopCreatorAddress),
    new web3.PublicKey(order.treasuryMint),
    new web3.PublicKey(order.programId)
  )[0].toString();

  const getCreditCardPayAvailability = useCallback(() => {
    CandyShopPay.checkPaymentAvailability({
      shopId: orderShopId,
      tokenAccount: order.tokenAccount
    })
      .then((res: SingleBase<string>) => {
        if (res.success) {
          setCreditCardPayAvailable(true);
        } else {
          console.log(
            `${Logger}: checkPaymentAvailability failed, token= ${order.name} ${order.tokenAccount}, reason=`,
            res.result
          );
          setCreditCardPayAvailable(false);
        }
      })
      .catch((err: Error) => {
        console.log(
          `${Logger}: checkPaymentAvailability failed, token= ${order.name} ${order.tokenAccount}, error=`,
          err
        );
        setCreditCardPayAvailable(false);
      });
  }, [order, orderShopId]);

  useEffect(() => {
    getCreditCardPayAvailability();
    setLoadingNftInfo(true);

    fetchNFTByMintAddress(order.tokenMint)
      .then((nft) => setNftInfo(nft))
      .catch((err) => {
        console.info(`${Logger}: fetchNFTByMintAddress failed:`, err);
      })
      .finally(() => {
        setLoadingNftInfo(false);
      });
  }, [order.tokenMint, getCreditCardPayAvailability]);

  const onClickedCardPayment = () => {
    setShowPaymentModal(true);
  };

  const onClosedCardPayment = () => {
    setShowPaymentModal(false);
  };

  const orderPrice = getPrice(shopPriceDecimalsMin, shopPriceDecimals, order.price, exchangeInfo);

  return (
    <>
      <div className="candy-buy-modal-thumbnail">
        <Viewer order={order} />
      </div>
      <div className="candy-buy-modal-container">
        <div className="candy-buy-modal-title">
          {order?.name}
          {order.verifiedNftCollection ? <NftVerification size={24} /> : null}
        </div>
        <div className="candy-buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          {walletPublicKey && (
            <div>
              <button className="candy-button candy-buy-modal-button" onClick={buy}>
                Buy Now
              </button>
              {creditCardPayAvailable && (
                <button className="candy-button candy-buy-modal-button" onClick={onClickedCardPayment}>
                  Pay by Credit Card
                </button>
              )}
            </div>
          )}
          {!walletPublicKey && walletConnectComponent}
        </div>
        {order.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
        )}
        <NftStat
          owner={order.walletAddress}
          tokenMint={order.tokenMint}
          edition={order.edition}
          sellerUrl={sellerUrl}
          candyShop={candyShop}
        />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />
      </div>

      {stripePublicKey && showPaymentModal && walletPublicKey && order && (
        <Modal onCancel={onClosedCardPayment} width={600}>
          <StripePayment
            stripePublicKey={stripePublicKey}
            shopProgramId={shopProgramId}
            shopAddress={orderShopId}
            walletAddress={walletPublicKey.toString()}
            order={order}
          ></StripePayment>
        </Modal>
      )}
    </>
  );
};
