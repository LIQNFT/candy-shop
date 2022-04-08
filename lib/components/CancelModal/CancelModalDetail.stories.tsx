import React from 'react';
import { ComponentMeta } from '@storybook/react';

import { candyShop, order } from '../../stories/mocks';

import { CancelModalDetail } from './CancelModalDetail';

export default {
  title: 'CancelModalDetail',
  component: CancelModalDetail,
} as ComponentMeta<typeof CancelModalDetail>;

export const Primary = (): JSX.Element => {
  return (
    <CancelModalDetail
      candyShop={candyShop}
      onCancel={() => console.log('CANCEL')}
      order={order}
      onChangeStep={(v) => console.log('change step', v)}
    />
  );
};
