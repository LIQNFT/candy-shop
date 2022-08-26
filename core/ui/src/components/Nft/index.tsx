import { CandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { CandyShop as CandyShopResponse, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CancelModal } from 'components/CancelModal';
import { Card } from 'components/Card';
import { SellModal } from 'components/SellModal';
import React, { useState } from 'react';
import { getExchangeInfo } from 'utils/getExchangeInfo';
import './index.less';

export interface NftProps {
  nft: SingleTokenInfo;
  wallet: AnchorWallet;
  sellDetail?: OrderSchema;
  shop: CandyShopResponse;
  candyShop: CandyShop;
}

export const Nft = ({ nft, wallet, sellDetail, shop, candyShop }: NftProps): JSX.Element => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    setSelection(nft);
  };

  const exchangeInfo = sellDetail
    ? getExchangeInfo(sellDetail, candyShop)
    : {
        symbol: candyShop.currencySymbol,
        decimals: candyShop.currencyDecimals
      };

  return (
    <>
      <Card
        name={nft?.metadata?.data?.name}
        ticker={nft?.metadata?.data?.symbol}
        imgUrl={nft?.nftImage}
        label={sellDetail ? <div className="candy-status-tag">Listed for Sale</div> : undefined}
        onClick={onClick}
      />

      {selection && !sellDetail && (
        <SellModal
          onCancel={onClose}
          nft={selection}
          wallet={wallet}
          shop={shop}
          connection={candyShop.connection()}
          shopAddress={candyShop.candyShopAddress}
          candyShopProgramId={candyShop.programId}
          candyShopVersion={candyShop.version}
          baseUnitsPerCurrency={candyShop.baseUnitsPerCurrency}
          shopTreasuryMint={candyShop.treasuryMint}
          shopCreatorAddress={candyShop.candyShopCreatorAddress}
          currencySymbol={candyShop.currencySymbol}
          candyShop={candyShop}
        />
      )}

      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          order={sellDetail}
          wallet={wallet}
          exchangeInfo={exchangeInfo}
          shopAddress={candyShop.candyShopAddress}
          candyShopProgramId={candyShop.programId}
          connection={candyShop.connection()}
          candyShopVersion={candyShop.version}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
          candyShop={candyShop}
        />
      ) : null}
    </>
  );
};
