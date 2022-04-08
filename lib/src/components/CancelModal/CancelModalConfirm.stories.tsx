import React from 'react';
import { ComponentMeta } from '@storybook/react';

import { order } from '../../stories/mocks';

import { CancelModalConfirm } from './CancelModalConfirm';

export default {
  title: 'CancelModalConfirm',
  component: CancelModalConfirm,
} as ComponentMeta<typeof CancelModalConfirm>;

export const Primary = (): JSX.Element => {
  const onCancelMock = () => {
    console.log('Storybook: cancel modal');
  };
  return <CancelModalConfirm onCancel={onCancelMock} order={order} />;
};
