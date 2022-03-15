import React from 'react';
import { notification } from 'antd';

export function errorNotification(err: any, onClose?: () => void) {
  notify({
    type: 'error',
    message: 'Error',
    description: err instanceof Error ? err.message : 'Unknown error occurred',
    onClose
  });
}

export function successNotification(msg: string, onClose?: () => void) {
  notify({
    type: 'success',
    message: 'Success',
    description: msg ?? 'Success!',
    onClose
  });
}

export function warnNotification(msg: string) {
  notify({
    type: 'warn',
    message: 'Warning',
    description: msg ?? 'Something wrong'
  });
}

export function infoNotification(msg: string, duration?: number) {
  notify({
    type: 'info',
    message: 'Info',
    description: msg ?? 'Information',
    duration: duration ?? 3
  });
}

let prevMsg: string | undefined = undefined;

export function notify({
  message = '',
  description = undefined as any,
  txid = '',
  type = 'info',
  placement = 'topRight',
  icon = undefined as any,
  duration = 4.5,
  onClose = () => {
    prevMsg = undefined;
  }
}) {
  // Avoid showing same messages many times, only show one time after re-render.
  if (prevMsg && prevMsg === message) {
    return;
  }
  prevMsg = message;

  (notification as any)[type]({
    message: <span>{ message } </span>,
    description: <span>{ description } </span>,
    icon: icon,
    placement,
    duration,
    onClose
  });
}