import React from 'react';
import styled from '@emotion/styled';
import Notification from 'rc-notification';

import IconSuccess from 'assets/IconSuccess';

let notificationIns: any = null;
Notification.newInstance(
  {
    style: { top: 20, left: 'unset', right: 10 },
    prefixCls: 'cds-rc-notification',
  },
  (n) => {
    notificationIns = n;
  }
);

export const notification = (content: string, type: string): void => {
  notificationIns.notice({
    content: (
      <NotiContent>
        {type === 'success' && <IconSuccess />}
        {type === 'error' && <IconSuccess />}
        {content}
      </NotiContent>
    ),
    duration: 3,
    prefixCls: 'cds',
  });
};

const NotiContent = styled.div`
  padding: 7px 20px 7px 10px;
  border-radius: 3px 3px;
  border: 1px solid #999;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 0px solid rgba(0, 0, 0, 0);
  background: #fff;
  display: flex;
  align-items: center;
  margin: 10px 0;

  svg {
    margin-right: 10px;
    width: 20px;
    height: 20px;
  }
`;
