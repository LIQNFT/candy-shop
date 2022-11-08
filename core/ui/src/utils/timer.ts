import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface TimeInfo {
  hour: string;
  minute: string;
  clockFormat: string;
  isNow?: boolean;
  date: string;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export const getStartTime = (timeData: TimeInfo): string => {
  if (!timeData.hour || !timeData.minute || !timeData.clockFormat) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  if (timeData.isNow) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  return (
    dayjs
      .utc(
        `${timeData.date} ${convertTime12to24(timeData.hour, timeData.minute, timeData.clockFormat)}`,
        'YYYY-MM-DD HH:mm'
      )
      .format('MMMM DD, YYYY hh:mmA') + ' UTC'
  );
};

export const convertTime12to24 = (hour: string, min: string, clockFormat: string): string => {
  if (hour === '12') {
    hour = '00';
  }
  if (clockFormat === 'PM') {
    hour = (parseInt(hour, 10) + 12).toString();
  }
  return `${hour}:${min}`;
};
