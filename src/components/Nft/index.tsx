import { Card } from 'antd';
import React, { useCallback, useState } from 'react';
import SellModal from '../SellModal';

const Nft = ({ nft }: { nft: any }) => {
  const [selection, setSelection] = useState();

  const onClose = useCallback(() => {
    setSelection(undefined);
  }, []);

  const onClick = useCallback(() => {
    setSelection(nft);
  }, [nft]);

  return (
    <>
      <Card
        className="candy-item"
        onClick={onClick}
        cover={
          <div className="candy-item-thumbnail">
            <img src={nft?.nftImage || 'https://via.placeholder.com/300'} />
          </div>
        }
      >
        <div>
          <p className="candy-label">ARTIST_NAME</p>
          <p>{nft?.metadata.data.name}</p>
        </div>
        <div>
          <p className="candy-label">PRICE</p>
          <p>--</p>
        </div>
      </Card>
      {selection && <SellModal onCancel={onClose} nft={selection} />}
    </>
  );
};

export default Nft;
