import React from 'react';
import { ComponentMeta } from '@storybook/react';
import ProcessSuccess from './index';

export default {
  title: 'ProcessSuccess',
  component: ProcessSuccess,
} as ComponentMeta<typeof ProcessSuccess>;

export const Primary = (): JSX.Element => {
  return <ProcessSuccess name="HI there" image={''} onCancel={() => {}} />;
};
