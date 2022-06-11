import React, { useState, useEffect } from 'react';
import { AuctionStatus } from '@liqnft/candy-shop-types';
import dayjs from 'dayjs';

interface CountdownProps {
  start: number;
  end: number;
  status: AuctionStatus;
}

export const Countdown: React.FC<CountdownProps> = ({ start, end, status }) => {
  const now = dayjs().unix();
  const value = now < start ? start : end;

  const [countdown, setCountdown] = useState<number>(value - now);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(value - dayjs().unix());
    }, 1000);

    return () => clearInterval(interval);
  }, [value]);

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown - hours * 3600) / 60);
  const seconds = countdown - hours * 3600 - minutes * 60;

  const hoursString = hours > 9 ? hours : `0${hours}`;
  const minutesString = `0${minutes}`.slice(-2);
  const secondsString = `0${seconds}`.slice(-2);

  // auction has ended
  if (
    countdown <= 0 ||
    status === AuctionStatus.COMPLETE ||
    status === AuctionStatus.EXPIRED ||
    status === AuctionStatus.CANCELLED
  ) {
    return <span className="candy-countdown candy-countdown-ended">Auction ended</span>;
  }

  // auction not started yet
  if (now < start) {
    return (
      <span className="candy-countdown candy-countdown-not-started">
        Auction starts in {`${hoursString}:${minutesString}:${secondsString}`}
      </span>
    );
  }

  // auction is in progress
  return <span className="candy-countdown">Auction ends in {`${hoursString}:${minutesString}:${secondsString}`}</span>;
};
