import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { ExplorerLink } from 'components/ExplorerLink';
import { Tag } from 'components/Tag';
import { CandyShop } from 'core/CandyShop';
import React, { useEffect, useMemo, useState } from 'react';
import { Nft, Order as OrderSchema } from 'solana-candy-shop-schema/dist';

export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  candyShop,
}) => {
  const orderPrice = useMemo(() => {
    return (Number(order?.price) / web3.LAMPORTS_PER_SOL).toFixed(2);
  }, [order]);

  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft | null>(null);

  useEffect(() => {
    if (order) {
      setLoadingNftInfo(true);
      candyShop
        .nftInfo(order.tokenMint)
        .then((nft) => setNftInfo(nft))
        .catch((err) => {
          console.info('fetchNftByMint failed:', err);
        })
        .finally(() => {
          setLoadingNftInfo(false);
        });
    }
  }, [order, candyShop]);

  return (
    <>
      <div>
        <div className="buy-modal-thumbnail">
          <img src={order?.nftImageLink || ''} alt="" />
        </div>
        <div className="buy-modal-attributes">
          <AttributesContainer>
            {loadingNftInfo ? (
              <div className="candy-loading" />
            ) : nftInfo?.attributes ? (
              nftInfo.attributes.map((attribute) => (
                <TagWithMargin>
                  <Tag text={`${attribute.trait_type}: ${attribute.value}`} />
                </TagWithMargin>
              ))
            ) : (
              <p>No attributes found</p>
            )}
          </AttributesContainer>
        </div>
      </div>
      <div className="buy-modal-container">
        <div className="buy-modal-title">{order?.name}</div>
        <div className="buy-modal-control">
          <div>
            <div className="candy-label">PRICE</div>
            <Price>{orderPrice} SOL</Price>
          </div>
          {!walletPublicKey ? (
            walletConnectComponent
          ) : (
            <button className="candy-button buy-modal-button" onClick={buy}>
              Buy Now
            </button>
          )}
        </div>
        <div className="buy-modal-description">
          <div className="candy-label">DESCRIPTION</div>
          <div className="candy-value">{order?.nftDescription}</div>
        </div>
        <div className="buy-modal-info">
          <div>
            <div className="candy-label">MINT ADDRESS</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.tokenMint} />
            </div>
          </div>
          <div className="buy-modal-info-line" />
          {order?.edition ? (
            <>
              <div>
                <div className="candy-label">EDITION</div>
                <div className="candy-value">{order?.edition}</div>
              </div>
              <div className="buy-modal-info-line" />
            </>
          ) : null}
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              <ExplorerLink type="address" address={order?.walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyModalDetail;

const Price = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const AttributesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const TagWithMargin = styled.div`
  margin-right: 8px;
  margin-bottom: 4px;
`;
