import React from 'react';
import styled from '@emotion/styled';
import Notification from 'rc-notification';
import IconSuccess from 'assets/IconSuccess';
import IconError from 'assets/IconError';

export enum NotificationType {
  Success = 'Success',
  Error = 'Error',
}

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
        <div className="cds-left">
          {type === 'success' && <IconSuccess />}
          {type === 'error' && <IconError />}
        </div>
        <div className="cds-right">
          {type === 'success' && <div className="title">Success</div>}
          {type === 'error' && <div className="title">Error</div>}
          <div className="desc">{content}</div>
        </div>
      </NotiContent>
    ),
    duration: 3,
    prefixCls: 'cds',
  });
};

const NotiContent = styled.div`
  font-family: Helvetica, Arial, sans-serif;
  padding: 7px 20px 7px 10px;
  display: flex;
  margin: 10px 0;

  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

  .cds-right {
    .title {
      font-size: 20px;
      line-height: 1;
    }
    .desc {
      font-size: 14px;
    }
  }

  .cds-left {
    display: flex;
    align-items: flex-start;
    margin-right: 10px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;
