import React from 'react';

import { Drop } from '@liqnft/candy-shop-types';
import { InputText } from 'components/Form';
import { FormProvider, useForm } from 'react-hook-form';

export interface EditionModalRedemptionProps {
  dropNft: Drop;
  onMint: (data: string) => void;
  onBack: () => void;
}

export const EditionModalRedemption: React.FC<EditionModalRedemptionProps> = ({ dropNft, onMint, onBack }) => {
  const methods = useForm();

  const onSubmit = (data: any) => {
    onMint(JSON.stringify(data));
  };

  return (
    <FormProvider {...methods}>
      <form className="candy-edition-modal-redemption" onSubmit={methods.handleSubmit(onSubmit)} method="POST">
        <div className="candy-edition-modal-redemption-header">
          <img src={dropNft.nftImage} alt={dropNft.nftName} />
          <div>{dropNft.nftName}</div>
        </div>

        <div className="candy-edition-modal-redemption-description">
          To confirm your purchase, please fill in additional information. You'll receive an email with a QR code
        </div>

        {dropNft.userInputsSchema.map((field) => (
          <InputText
            key={field.name}
            name={field.name}
            label={field.label}
            required
            title={field.type === 'email' ? 'Only email address is allowed' : ''}
            type={field.type}
            pattern={
              field.type === 'email'
                ? {
                    message: 'Only email address is allowed',
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g
                  }
                : undefined
            }
          />
        ))}

        <div>
          If you don’t receive an email with a QR code, please contact support@candyshop.space and we’ll help verify
          your address.
        </div>

        <div className="candy-edition-modal-buttons-footer">
          <button className="candy-button candy-button-outlined" onClick={onBack}>
            Back
          </button>
          <button className="candy-button" type="submit">
            Confirm
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
