import React, { useRef, useEffect, useReducer } from 'react';

import { IconClock } from 'assets/IconClock';

import { getCountdownTimerString } from 'utils/helperFunc';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export const VaultCountdown: React.FC<{ launchTime: number; whitelistTime?: number }> = (props) => {
  const [refresh, setRefresh] = useReducer(
    (s: number, val: number | undefined) => (val !== undefined ? val : s + 1),
    0
  );

  useEffect(() => {
    if (refresh === 0) return;
    const timeout = setTimeout(() => setRefresh(undefined), 1_000);
    return () => clearTimeout(timeout);
  }, [refresh]);
  const startCount = useRef(false);

  // by default, countdown to mint time
  let launchMoment = dayjs.unix(props.launchTime);
  let timeToLaunch = dayjs.duration(dayjs().diff(launchMoment));
  let message = 'Mint starts in ';

  // if there is a whitelist...
  const whitelistMoment = props.whitelistTime ? dayjs.unix(props.whitelistTime) : undefined;
  if (whitelistMoment) {
    // countdown to whitelist time if before whitelist time
    if (whitelistMoment.unix() > dayjs().unix()) {
      launchMoment = whitelistMoment;
      timeToLaunch = dayjs.duration(dayjs().diff(whitelistMoment));
      message = 'Private sale starts in ';
    } else {
      // otherwise, countdown to public mint
      message = 'Public mint starts in ';
    }
  }

  // if vault already launched, display nothing
  if (dayjs() >= launchMoment) {
    if (refresh !== 0) setRefresh(0);
    return null;
  }

  const timeToLaunchInDays = timeToLaunch.asDays();
  let countdown: React.ReactElement | null = null;
  if (timeToLaunchInDays < -180) {
    // if more than 180 days away, do not display countdown
    return null;
  } else if (timeToLaunchInDays < -7) {
    // if more than 7 days away, show a human readable countdown
    countdown = <>{timeToLaunch.humanize()}</>;
  } else {
    if (!startCount.current) {
      startCount.current = true;
      setRefresh(undefined);
    }
    // if less than 7 days away, show countdown
    countdown = <>{getCountdownTimerString(launchMoment.unix() - dayjs().unix())}</>;
  }

  return (
    <div className="timer">
      <IconClock />
      {message}
      {countdown}
    </div>
  );
};
