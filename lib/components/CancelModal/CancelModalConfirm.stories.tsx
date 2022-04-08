import React from 'react';
import { ComponentMeta } from '@storybook/react';

import { candyShop, order } from '../../stories/mocks';

import { CancelModalConfirm } from './CancelModalConfirm';

export default {
  title: 'CancelModalConfirm',
  component: CancelModalConfirm,
} as ComponentMeta<typeof CancelModalConfirm>;

export const Primary = (): JSX.Element => {
  return (
    <CancelModalConfirm
      candyShop={candyShop}
      onCancel={() => {}}
      order={order}
    />
  );
};
