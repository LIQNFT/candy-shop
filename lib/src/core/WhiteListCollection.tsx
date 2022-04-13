import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { web3 } from '@project-serum/anchor';
import { CandyShop } from './CandyShop';

import { WhitelistModal } from 'components/WhitelistModal';
import { DeleteModal } from 'components/DeleteModal';
import { Whitelist } from 'components/Whitelist';
import { IconPlus } from 'assets/IconPlus';

import { ListBase, WhitelistNft } from 'solana-candy-shop-schema/dist';
import { LoadStatus } from 'constant/loading';
import { notification } from 'utils/rc-notification';

enum MODAL_TYPE {
  NONE = 'NONE',
  ADD = 'ADD',
  DELETE = 'DELETE',
}

interface WhiteListCollectionProps {
  candyShop: CandyShop;
  walletPublicKey?: web3.PublicKey;
  signMessage?: (...arg: any) => Promise<Uint8Array>;
}

export const WhitelistCollection: React.FC<WhiteListCollectionProps> = ({
  candyShop,
  walletPublicKey,
  signMessage,
}) => {
  const [collections, setCollections] = useState<WhitelistNft[]>([]);
  const [open, setOpen] = useState<MODAL_TYPE>(MODAL_TYPE.NONE);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [delWl, setDelWl] = useState<WhitelistNft | null>(null);

  const onCloseModal = () => {
    setOpen(MODAL_TYPE.NONE);
  };

  const onCloseDeleteModal = () => {
    setDelWl(null);
    setOpen(MODAL_TYPE.NONE);
  };

  const onAddWhitelist = () => setOpen(MODAL_TYPE.ADD);

  const getWlNfts = useCallback(() => {
    setLoading(LoadStatus.Loading);
    candyShop
      .shopWlNfts()
      .then((data: ListBase<WhitelistNft>) => {
        setCollections(data.result);
        setLoading(LoadStatus.Loaded);
      })
      .finally(() => {
        setLoading(LoadStatus.Loaded);
      });
  }, [candyShop]);

  const openDeleteModal = (item: WhitelistNft) => () => {
    setDelWl(item);
    setOpen(MODAL_TYPE.DELETE);
  };

  const onDelWl = async () => {
    if (!delWl || !signMessage || !walletPublicKey) return;

    const message = { identifiers: [delWl.identifier] };

    const messageB64 = Buffer.from(JSON.stringify(message));
    const signature = await signMessage(messageB64);

    const body = {
      signature: Buffer.from(signature).toString('base64'),
      message: messageB64.toString('base64'),
      publicKey: walletPublicKey.toBuffer().toString('base64'),
    };

    candyShop.deleteShopWhitelist(body).then((data: any) => {
      if (data.data.success) {
        notification('Delete whitelist successfully.', 'success');
        onCloseModal();
        getWlNfts();
        return;
      }

      notification('Transaction failed. Please try again later.', 'error');
    });
  };

  useEffect(() => {
    if (!walletPublicKey) return;
    getWlNfts();
  }, [walletPublicKey]);

  return (
    <>
      <Wrap className="cds-container">
        {loading !== LoadStatus.ToLoad && (
          <Whitelist
            collections={collections}
            loading={loading}
            openDeleteModal={openDeleteModal}
          />
        )}

        <Button className="cds-text-btn" onClick={onAddWhitelist}>
          <IconPlus /> Whitelist collection for sale
        </Button>
      </Wrap>
      {open === MODAL_TYPE.ADD ? (
        <WhitelistModal
          onClose={onCloseModal}
          candyShop={candyShop}
          signMessage={signMessage}
          walletPublicKey={walletPublicKey}
          getWlNfts={getWlNfts}
        />
      ) : null}
      {open === MODAL_TYPE.DELETE && !!delWl ? (
        <DeleteModal onCancel={onCloseDeleteModal} onDelete={onDelWl} />
      ) : null}
    </>
  );
};

const Wrap = styled.div`
  font-family: Helvetica, Arial, sans-serif;
`;

const Button = styled.div`
  margin-top: 20px;
  width: max-content;

  display: flex;
  align-items: center;

  svg {
    margin-right: 4px;
  }
`;
