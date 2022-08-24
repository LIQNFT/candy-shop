export enum EventName {
  ping = 'ping',
  pong = 'pong',
  startSession = 'startSession',
  stopSession = 'stopSession',
  orderOpened = 'orderOpened',
  orderFilled = 'orderFilled',
  orderCanceled = 'orderCanceled',
  traded = 'traded',
  auctionCreated = 'auctionCreated',
  auctionUpdated = 'auctionUpdated',
  auctionUpdateBid = 'auctionUpdateBid',
  auctionUpdateStatus = 'auctionUpdateStatus',
  getAuctionByAddressAndWallet = 'getAuctionByAddressAndWallet',
  dropCreatedOrUpdated = 'dropCreatedOrUpdated'
}

export function parseSocketMessage<T>(message: string): { event: EventName; data: T } | undefined {
  try {
    return JSON.parse(message);
  } catch (error) {
    console.log('Parse socket message error=', error);
  }
}

export function stringifyMessage(data: { event: EventName; data: any }): string {
  return JSON.stringify(data);
}
