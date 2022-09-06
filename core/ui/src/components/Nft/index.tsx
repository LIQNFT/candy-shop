import { Blockchain, CandyShop, EthCandyShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { CandyShop as CandyShopResponse, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CancelModal } from 'components/CancelModal';
import { Card } from 'components/Card';
import { SellModal } from 'components/SellModal';
import { CommonChain, EthWallet } from 'model';
import React, { useState } from 'react';
import { getDefaultExchange, getExchangeInfo } from 'utils/getExchangeInfo';
import './index.less';

export interface NftType<C, S, W> extends CommonChain<C, S, W> {
  nft: SingleTokenInfo;
  sellDetail?: OrderSchema;
  shop: CandyShopResponse;
}
type NftProps =
  | NftType<Blockchain.Ethereum, EthCandyShop, EthWallet>
  | NftType<Blockchain.Solana, CandyShop, AnchorWallet>;

export const Nft = ({ nft, sellDetail, shop, ...chainProps }: NftProps): JSX.Element => {
  const [selection, setSelection] = useState<SingleTokenInfo | undefined>();

  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    setSelection(nft);
  };

  const exchangeInfo =
    sellDetail && chainProps.blockchain === Blockchain.Solana
      ? getExchangeInfo(sellDetail, chainProps.candyShop)
      : getDefaultExchange(chainProps.candyShop);

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
          shop={shop}
          connection={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.connection() : undefined}
          shopAddress={chainProps.candyShop.candyShopAddress}
          candyShopProgramId={chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.programId : undefined}
          baseUnitsPerCurrency={
            chainProps.blockchain === Blockchain.Solana ? chainProps.candyShop.baseUnitsPerCurrency : 0
          }
          shopTreasuryMint={chainProps.candyShop.treasuryMint}
          shopCreatorAddress={chainProps.candyShop.candyShopCreatorAddress}
          currencySymbol={chainProps.candyShop.currencySymbol}
          {...chainProps}
        />
      )}

      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          order={sellDetail}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={chainProps.candyShop.priceDecimalsMin}
          shopPriceDecimals={chainProps.candyShop.priceDecimals}
          {...chainProps}
        />
      ) : null}
    </>
  );
};
