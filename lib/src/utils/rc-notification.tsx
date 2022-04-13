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
    style: { top: 10, left: 'unset', right: 10 },
    prefixCls: 'candy-notification',
  },
  (n) => {
    notificationIns = n;
  }
);

export const notification = (content: string, type: string): void => {
  notificationIns.notice({
    content: (
      <NotiContent>
        <div className="candy-left">
          {type === 'success' && <IconSuccess />}
          {type === 'error' && <IconError />}
        </div>
        <div className="candy-right">
          {type === 'success' && <div className="title">Success</div>}
          {type === 'error' && <div className="title">Error</div>}
          <div className="desc">{content}</div>
        </div>
      </NotiContent>
    ),
    duration: 3,
    prefixCls: 'candy',
  });
};

const NotiContent = styled.div`
  padding: 12px 20px 12px 10px;
  display: flex;
  margin: 10px 0;

  border-radius: 8px;
  background-color: #fff;
  color: black;
  border: 1px solid #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

  .candy-right {
    .title {
      font-size: 18px;
      line-height: 24px;
    }
    .desc {
      font-size: 14px;
    }
  }

  .candy-left {
    display: flex;
    align-items: center;
    margin-right: 10px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;
