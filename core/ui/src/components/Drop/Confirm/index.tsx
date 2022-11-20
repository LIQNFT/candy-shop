import React from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop, EditionDrop } from '@liqnft/candy-shop-sdk';
import { FormType } from '../Form';
import { convertTime12to24, getStartTime } from 'utils/timer';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import './style.less';

import { BN, web3 } from '@project-serum/anchor';
import { notification, NotificationType } from 'utils/rc-notification';
import { handleError } from 'utils/ErrorHandler';

interface CreateEditionDropProps {
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  dropNft: EditionDrop;
  onBack: () => void;
  formData: FormType;
  onCreateDropSuccess?: (auctionedToken: EditionDrop) => void;
  fee?: number;
}

const Logger = 'CandyShopUI/CreateDrop';

export const CreateEditionDropConfirm: React.FC<CreateEditionDropProps> = ({
  candyShop,
  dropNft,
  onBack,
  formData,
  wallet,
  onCreateDropSuccess
}) => {
  const onCreateEdition = () => {
    if (!wallet) return;

    const startTime = new BN(
      dayjs(
        `${formData.launchDate} ${convertTime12to24(
          formData.launchHour,
          formData.launchMinute,
          formData.launchTimeFormat
        )} UTC`
      ).unix()
    );
    const whitelistTime = formData.whitelistRelease
      ? new BN(
          dayjs(
            `${formData.whitelistDate} ${convertTime12to24(
              formData.whitelistHour,
              formData.whitelistMinute,
              formData.whitelistTimeFormat
            )} UTC`
          ).unix()
        )
      : undefined;

    candyShop
      .commitMasterNft({
        nftOwner: wallet,
        nftOwnerTokenAccount: new web3.PublicKey(dropNft.tokenAccountAddress),
        masterMint: new web3.PublicKey(dropNft.tokenMintAddress),
        price: new BN(Number(formData.mintPrice) * 10 ** candyShop.currencyDecimals),
        startTime,
        whitelistTime,
        salesPeriod: new BN(Number(formData.salesPeriod) * 60),
        whitelistMint: formData.whitelistRelease ? new web3.PublicKey(formData.whitelistAddress) : undefined
      })
      .then(() => {
        notification('Edition Drop created.\nRemember to edit and update the description.', NotificationType.Success);
        onCreateDropSuccess && onCreateDropSuccess(dropNft);
      })
      .catch((error: Error) => {
        handleError(error, 'Create edition drop failed');
        console.log(`${Logger}: Create Drop failed=`, error);
      });
  };

  const confirmDetails = [
    { name: 'Owner', value: candyShop.candyShopCreatorAddress.toString() },
    { name: 'Drop Name', value: formData.name },
    { name: 'Total Edition Available', value: dropNft.maxSupply.toString() },
    {
      name: 'Mint Price',
      value: `${Number(formData.mintPrice)} ${candyShop.currencySymbol}`
    },
    {
      name: 'Launch Date',
      value: getStartTime({
        hour: formData.launchHour,
        minute: formData.launchMinute,
        date: formData.launchDate,
        clockFormat: formData.launchTimeFormat
      })
    },
    {
      name: 'Sales Period (mins)',
      value: formData.salesPeriod
    }
  ];

  if (formData.whitelistRelease) {
    confirmDetails.push(
      {
        name: 'Whitelist Launch Date',
        value: getStartTime({
          hour: formData.whitelistHour,
          minute: formData.whitelistMinute,
          date: formData.whitelistDate,
          clockFormat: formData.whitelistTimeFormat
        })
      },
      {
        name: 'Whitelist Token Address',
        value: formData.whitelistAddress
      }
    );
  }

  return (
    <div className="candy-auction-confirm-container">
      <div className="candy-auction-confirm-title">
        Please note you will only be able to cancel and retrieve the master NFT up until the launch date (whitelist or
        public) and afterwards the NFT will be permanently locked. Please review carefully and confirm details on your
        new edition drop.
      </div>

      <div className="candy-auction-confirm-break" />
      {confirmDetails.map(({ name, value }: { name: string; value: string }) => (
        <div className="candy-auction-confirm" key={name}>
          <span>{name}</span>
          <div>{value}</div>
        </div>
      ))}

      <div className="candy-auction-confirm-button-container">
        <button className="candy-button candy-button-default" onClick={onBack}>
          Back
        </button>
        <button className="candy-button candy-auction-confirm-button" onClick={onCreateEdition}>
          Confirm
        </button>
      </div>
    </div>
  );
};
