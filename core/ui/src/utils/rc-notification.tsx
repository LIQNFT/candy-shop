import React from 'react';

import Notification from 'rc-notification';
import IconSuccess from 'assets/IconSuccess';
import IconError from 'assets/IconError';

export enum NotificationType {
  Success = 'Success',
  Error = 'Error'
}

let notificationIns: any = null;
Notification.newInstance(
  {
    style: { top: 10, left: 'unset', right: 10 },
    prefixCls: 'candy-notification'
  },
  (n) => {
    notificationIns = n;
  }
);

export const notification = (content: string, type: NotificationType, durationSec?: number): void => {
  notificationIns.notice({
    content: (
      <div className="candy-notification-content">
        <div className="candy-left">
          {type === NotificationType.Success && <IconSuccess />}
          {type === NotificationType.Error && <IconError />}
        </div>
        <div className="candy-right">
          {type === NotificationType.Success && <div className="title">Success</div>}
          {type === NotificationType.Error && <div className="title">Error</div>}
          <div className="desc">{content}</div>
        </div>
      </div>
    ),
    duration: durationSec ?? 3,
    prefixCls: 'candy'
  });
};
