import React, { createContext, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { parseSocketMessage, EventName, stringifyMessage } from 'constant/SocketEvent';
import { Cluster } from '@solana/web3.js';

// TODO: update websocket url for each ENV
const getSocketUrl = (network: Cluster) => {
  switch (network) {
    case 'mainnet-beta':
      return 'wss://ckaho.liqnft.com/websocket';
    default:
      return 'wss://ckaho.liqnft.com/websocket';
  }
};

const createSocket = (network: Cluster): WebSocket => new WebSocket(getSocketUrl(network));

interface SocketContextData {
  socket?: WebSocket;
  onSocketEvent: (event: EventName, callback: (data: any) => void) => AbortController;
  onSendEvent: (event: EventName, data: unknown) => boolean;
}
const SocketContext = createContext<SocketContextData | null>(null);

interface SocketProviderProps {
  children: ReactElement;
  candyShopAddress?: string;
  network?: Cluster;
}

const RECONNECT_SOCKET_TIME = 2_000;
const TIMEOUT_HEARTBEAT = 30_000;

let timeoutReconnectSocket: NodeJS.Timeout;

export const SocketProvider: React.FC<SocketProviderProps> = React.memo(({ children, candyShopAddress, network }) => {
  const [socket, setSocket] = useState<WebSocket>();

  const onSocketEvent = useCallback(
    (event: EventName, callback: (data: any) => void) => {
      const controller = new AbortController();
      if (!socket) return controller;

      socket.addEventListener(
        'message',
        (eventData: MessageEvent) => {
          const message = parseSocketMessage(eventData.data);
          if (!message || message.event !== event) return;
          callback(message.data);
        },
        { signal: controller.signal }
      );

      return controller;
    },
    [socket]
  );

  const onSendEvent = useCallback(
    (event: EventName, data: any): boolean => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return false;
      const message = stringifyMessage({ event, data });
      socket.send(message);
      return true;
    },
    [socket]
  );

  // join subscribe event
  useEffect(() => {
    if (!candyShopAddress || !socket) return;

    const sessionId = candyShopAddress.toString();
    onSendEvent(EventName.startSession, { sessionId });
    return () => {
      onSendEvent(EventName.stopSession, { sessionId });
    };
  }, [candyShopAddress, onSendEvent, socket]);

  // client heartbeat
  useEffect(() => {
    if (!socket) return;

    let pongTimeout: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;
    onSendEvent(EventName.ping, null);
    const controller = onSocketEvent(EventName.pong, () => {
      clearTimeout(closeTimeout);
      pongTimeout = setTimeout(() => onSendEvent(EventName.ping, null), TIMEOUT_HEARTBEAT);
      closeTimeout = setTimeout(() => socket.close(), TIMEOUT_HEARTBEAT + 2_000);
    });
    return () => {
      controller.abort();
      clearTimeout(pongTimeout);
      clearTimeout(closeTimeout);
    };
  }, [onSocketEvent, onSendEvent, socket]);

  // Initial socket
  useEffect(() => {
    if (!network) return;
    const connectSocket = () => {
      const socket = createSocket(network);

      socket.onopen = () => {
        console.log('%cOPEN WEBSOCKET', 'color: #42f587;');
        clearTimeout(timeoutReconnectSocket);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.socket = socket;
        setSocket(socket);
      };
      socket.onclose = () => {
        console.log('%cSOCKET ONCLOSE', 'color: #42f587;');
        // re-connect socket
        clearTimeout(timeoutReconnectSocket);
        timeoutReconnectSocket = setTimeout(() => connectSocket(), RECONNECT_SOCKET_TIME);
      };

      socket.onerror = (err) => {
        console.log('%cSOCKET ERROR', 'color: #42f587;', err);
        console.warn(err);
      };
    };
    connectSocket();
  }, [network]);

  return <SocketContext.Provider value={{ socket, onSocketEvent, onSendEvent }}>{children}</SocketContext.Provider>;
});

export const useSocket = (): SocketContextData => useContext(SocketContext) as SocketContextData;
export { EventName };
