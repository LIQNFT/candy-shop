import React, { useState } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, CANDY_SHOP_V2_PROGRAM_ID, MasterEditionNft } from '@liqnft/candy-shop-sdk';

import { CreateEditionDropConfirm } from 'components/Drop/Confirm';
import { CreateEditionForm } from 'components/Drop/Form';
import { FormType } from 'components/Drop/Form/Form.utils';
import { DropSelection } from 'components/Drop/Selection';

import './style.less';

interface CreateDropProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  walletConnectComponent: React.ReactElement;
  onCreatedDropSuccess?: (auctionedToken: MasterEditionNft) => void;
  cacheUserNFT?: boolean;
}

enum DropStage {
  SELECT = 'SELECT',
  DETAIL = 'DETAIL',
  CONFIRMING = 'CONFIRMING'
}

const STEPS = [
  { title: 'Select an NFT', stage: DropStage.SELECT },
  { title: 'Edition Details', stage: DropStage.DETAIL },
  { title: 'Confirmation', stage: DropStage.CONFIRMING }
];

const PROGRAM_ID_V2 = CANDY_SHOP_V2_PROGRAM_ID.toString();

const isShopWithProgramIdV2 = (programId: string) => programId === PROGRAM_ID_V2;

export const CreateDrop: React.FC<CreateDropProps> = ({
  candyShop,
  wallet,
  walletConnectComponent,
  onCreatedDropSuccess
}) => {
  const [stage, setStage] = useState<DropStage>(DropStage.SELECT);
  const [dropNft, setDropNft] = useState<MasterEditionNft>();
  const [editionForm, setEditionForm] = useState<FormType>();

  const onClickCard = (item: MasterEditionNft) => () => setDropNft(item);

  const onGoToNextAuctionDetail = () => {
    setStage(DropStage.DETAIL);
    window.scrollTo({ top: document.getElementById('candy-edition-title-id')?.offsetTop, behavior: 'smooth' });
  };

  const ViewStages = (
    <div className="candy-container">
      {stage === DropStage.SELECT && (
        <DropSelection
          candyShop={candyShop}
          dropNft={dropNft}
          onSelect={onClickCard}
          onNext={onGoToNextAuctionDetail}
          wallet={wallet}
          walletConnectComponent={walletConnectComponent}
        />
      )}

      {stage === DropStage.DETAIL && dropNft ? (
        <CreateEditionForm
          nft={dropNft}
          formData={editionForm}
          currencySymbol={candyShop.currencySymbol}
          onBack={() => {
            setStage(DropStage.SELECT);
            setEditionForm(undefined);
          }}
          onSubmit={(form: FormType) => {
            setEditionForm(form);
            setStage(DropStage.CONFIRMING);
          }}
        />
      ) : null}
      {stage === DropStage.CONFIRMING && dropNft && editionForm && (
        <CreateEditionDropConfirm
          candyShop={candyShop}
          wallet={wallet}
          dropNft={dropNft}
          onBack={() => setStage(DropStage.DETAIL)}
          formData={editionForm}
          onCreateDropSuccess={(masterEditionNft: MasterEditionNft) =>
            onCreatedDropSuccess && onCreatedDropSuccess(masterEditionNft)
          }
        />
      )}
    </div>
  );

  const NotProgramIdV2ShopNotification = (
    <div className="candy-edition-description">
      You must use shop created from programId {PROGRAM_ID_V2} to create Edition Drop.
    </div>
  );

  return (
    <div className="candy-edition">
      <div className="candy-title" id="candy-edition-title-id">
        Create a New Edition Drop
      </div>
      <div className="candy-edition-content">
        <div className="candy-edition-content-step">
          <div className="candy-edition-step-connector" />
          {STEPS.map((step, idx) => (
            <div key={idx} className={`candy-edition-step ${stage === step.stage ? 'candy-edition-step-active' : ''}`}>
              <span>{idx + 1}</span>
              {step.title}
            </div>
          ))}
        </div>

        <div className="candy-edition-content-detail">
          {wallet && isShopWithProgramIdV2(candyShop.programId) ? ViewStages : NotProgramIdV2ShopNotification}
          {!wallet && walletConnectComponent}
        </div>
      </div>
    </div>
  );
};
